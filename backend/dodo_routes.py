"""
Dodo Payments Integration Routes
Handles subscription creation, customer portal, and webhooks
"""
import os
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from standardwebhooks.webhooks import Webhook
from motor.motor_asyncio import AsyncIOMotorClient
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dodo_payments import get_dodo_client, get_product_id
from models import PaymentSessionRequest, PaymentSessionResponse
from auth import verify_jwt_token

# Setup logging
logger = logging.getLogger(__name__)

# Helper function to get current user (duplicated from server.py to avoid circular import)
async def get_current_user(request: Request):
    """Get current user from JWT token or OAuth session token"""
    # MongoDB client for session lookup
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db_name = os.getenv("DB_NAME", "test_database")
    db = client[db_name]
    
    # First try to get session token from cookie
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token})
        if session and session.get("expires_at") > datetime.utcnow():
            user = await db.users.find_one({"_id": session["user_id"]})
            if user:
                return {"user_id": user["_id"], "email": user["email"], "name": user.get("name", "")}
    
    # Fallback to Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    
    # Try as session token first
    session = await db.user_sessions.find_one({"session_token": token})
    if session and session.get("expires_at") > datetime.utcnow():
        user = await db.users.find_one({"_id": session["user_id"]})
        if user:
            return {"user_id": user["_id"], "email": user["email"], "name": user.get("name", "")}
    
    # Try as JWT token
    try:
        return verify_jwt_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create router
router = APIRouter(prefix="/api", tags=["dodo-payments"])

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Get frontend URL from environment
FRONTEND_URL = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:3000").replace("/api", "")

@router.post("/dodo/create-subscription")
async def create_dodo_subscription(
    request: PaymentSessionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a Dodo Payments subscription checkout session
    """
    try:
        # Initialize Dodo client
        dodo_client = get_dodo_client()
        
        # Get product ID based on plan and billing interval
        product_id = get_product_id(request.package_id, request.billing_interval)
        
        # Get user details
        user_email = current_user.get("email")
        user_name = current_user.get("name", "")
        user_id = current_user.get("user_id")
        
        logger.info(f"Creating Dodo subscription for user {user_email}, plan: {request.package_id}, interval: {request.billing_interval}")
        
        # Create subscription with payment link
        subscription_response = await dodo_client.subscriptions.create(
            product_id=product_id,
            quantity=1,
            payment_link=True,
            return_url=f"{FRONTEND_URL}/dashboard?payment=success",
            customer={
                "email": user_email,
                "name": user_name
            },
            billing={
                "name": user_name,
                "email": user_email
            },
            metadata={
                "user_id": user_id,
                "plan": request.package_id,
                "billing_interval": request.billing_interval
            }
        )
        
        # Extract payment link and subscription ID
        payment_link = subscription_response.payment_link
        subscription_id = subscription_response.subscription_id
        
        logger.info(f"Dodo subscription created: {subscription_id}")
        
        # Store initial subscription record
        await db.subscriptions.insert_one({
            "user_id": user_id,
            "subscription_id": subscription_id,
            "plan": request.package_id,
            "billing_interval": request.billing_interval,
            "status": "pending",
            "payment_provider": "dodo",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        return PaymentSessionResponse(
            checkout_url=payment_link,
            session_id=subscription_id
        )
        
    except Exception as e:
        logger.error(f"Error creating Dodo subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")


@router.post("/dodo/create-portal-session")
async def create_dodo_portal_session(current_user: dict = Depends(get_current_user)):
    """
    Create a Dodo Payments customer portal session
    """
    try:
        dodo_client = get_dodo_client()
        user_email = current_user.get("email")
        
        # Get user's subscription to find customer_id
        subscription = await db.subscriptions.find_one({
            "user_id": current_user.get("user_id"),
            "payment_provider": "dodo"
        })
        
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")
        
        customer_id = subscription.get("customer_id")
        if not customer_id:
            raise HTTPException(status_code=404, detail="Customer ID not found in subscription")
        
        # Create customer portal session
        portal_response = await dodo_client.customers.customer_portal.create(
            customer_id=customer_id
        )
        
        return {"portal_url": portal_response.url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating portal session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")


@router.post("/webhook/dodo")
async def dodo_webhook(request: Request):
    """
    Handle Dodo Payments webhook events
    """
    try:
        # Get webhook secret from environment
        webhook_secret = os.getenv("DODO_PAYMENTS_WEBHOOK_SECRET")
        if not webhook_secret:
            logger.error("DODO_PAYMENTS_WEBHOOK_SECRET not configured")
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
        # Get raw body and headers
        body = (await request.body()).decode('utf-8')
        headers = {
            "webhook-id": request.headers.get("webhook-id"),
            "webhook-signature": request.headers.get("webhook-signature"),
            "webhook-timestamp": request.headers.get("webhook-timestamp")
        }
        
        # Verify webhook signature
        wh = Webhook(webhook_secret)
        try:
            payload = wh.verify(body, headers)
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Process event based on type
        event_type = payload.get("type")
        event_data = payload.get("data", {})
        
        logger.info(f"Processing Dodo webhook event: {event_type}")
        
        # Handle subscription.active event
        if event_type == "subscription.active":
            await handle_subscription_active(event_data)
        
        # Handle subscription.renewed event
        elif event_type == "subscription.renewed":
            await handle_subscription_renewed(event_data)
        
        # Handle subscription.on_hold event
        elif event_type == "subscription.on_hold":
            await handle_subscription_on_hold(event_data)
        
        # Handle subscription.cancelled event
        elif event_type == "subscription.cancelled":
            await handle_subscription_cancelled(event_data)
        
        # Handle subscription.failed event
        elif event_type == "subscription.failed":
            await handle_subscription_failed(event_data)
        
        # Handle payment.succeeded event
        elif event_type == "payment.succeeded":
            await handle_payment_succeeded(event_data)
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")


async def handle_subscription_active(data: dict):
    """Handle subscription.active event"""
    subscription_id = data.get("subscription_id")
    customer_id = data.get("customer_id")
    product_id = data.get("product_id")
    
    logger.info(f"Subscription activated: {subscription_id}")
    
    # Update subscription in database
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "active",
                "customer_id": customer_id,
                "activated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update user's subscription status
    subscription = await db.subscriptions.find_one({"subscription_id": subscription_id})
    if subscription:
        await db.users.update_one(
            {"user_id": subscription["user_id"]},
            {
                "$set": {
                    "subscription_status": "active",
                    "subscription_tier": subscription["plan"],
                    "updated_at": datetime.utcnow()
                }
            }
        )


async def handle_subscription_renewed(data: dict):
    """Handle subscription.renewed event"""
    subscription_id = data.get("subscription_id")
    logger.info(f"Subscription renewed: {subscription_id}")
    
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "active",
                "last_renewed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )


async def handle_subscription_on_hold(data: dict):
    """Handle subscription.on_hold event"""
    subscription_id = data.get("subscription_id")
    logger.warning(f"Subscription on hold: {subscription_id}")
    
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "on_hold",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update user status
    subscription = await db.subscriptions.find_one({"subscription_id": subscription_id})
    if subscription:
        await db.users.update_one(
            {"user_id": subscription["user_id"]},
            {"$set": {"subscription_status": "on_hold"}}
        )


async def handle_subscription_cancelled(data: dict):
    """Handle subscription.cancelled event"""
    subscription_id = data.get("subscription_id")
    logger.info(f"Subscription cancelled: {subscription_id}")
    
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update user status
    subscription = await db.subscriptions.find_one({"subscription_id": subscription_id})
    if subscription:
        await db.users.update_one(
            {"user_id": subscription["user_id"]},
            {"$set": {"subscription_status": "cancelled"}}
        )


async def handle_subscription_failed(data: dict):
    """Handle subscription.failed event"""
    subscription_id = data.get("subscription_id")
    logger.error(f"Subscription failed: {subscription_id}")
    
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {
            "$set": {
                "status": "failed",
                "updated_at": datetime.utcnow()
            }
        }
    )


async def handle_payment_succeeded(data: dict):
    """Handle payment.succeeded event"""
    payment_id = data.get("payment_id")
    subscription_id = data.get("subscription_id")
    amount = data.get("amount")
    
    logger.info(f"Payment succeeded: {payment_id} for subscription {subscription_id}")
    
    # Record payment transaction
    await db.payment_transactions.insert_one({
        "payment_id": payment_id,
        "subscription_id": subscription_id,
        "amount": amount,
        "status": "succeeded",
        "payment_provider": "dodo",
        "created_at": datetime.utcnow()
    })


@router.post("/enterprise-contact")
async def enterprise_contact(request: Request):
    """
    Handle Enterprise tier contact form submissions
    """
    try:
        data = await request.json()
        
        # Validate required fields
        required_fields = ["name", "company_name", "email", "phone", "message"]
        for field in required_fields:
            if not data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Store in database
        contact_data = {
            "name": data.get("name"),
            "company_name": data.get("company_name"),
            "website": data.get("website", ""),
            "phone": data.get("phone"),
            "email": data.get("email"),
            "message": data.get("message"),
            "submitted_at": datetime.utcnow(),
            "status": "pending"
        }
        
        await db.enterprise_contacts.insert_one(contact_data)
        
        # Send email notification
        try:
            send_enterprise_contact_email(contact_data)
        except Exception as email_error:
            logger.error(f"Failed to send email notification: {str(email_error)}")
            # Don't fail the request if email fails
        
        return {"status": "success", "message": "Your request has been submitted. We'll contact you soon!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing enterprise contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process contact form")


def send_enterprise_contact_email(contact_data: dict):
    """
    Send email notification for enterprise contact form
    This is a simple implementation - you may want to use a proper email service
    """
    try:
        # Email content
        subject = f"Enterprise Inquiry from {contact_data['company_name']}"
        body = f"""
New Enterprise Contact Form Submission

Name: {contact_data['name']}
Company: {contact_data['company_name']}
Website: {contact_data.get('website', 'N/A')}
Email: {contact_data['email']}
Phone: {contact_data['phone']}

Message:
{contact_data['message']}

Submitted at: {contact_data['submitted_at']}
"""
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = "noreply@yourbankstatementconverter.com"
        msg['To'] = "info@yourbankstatementconverter.com"
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        # Note: This is a basic implementation
        # In production, you should use a proper email service like SendGrid, AWS SES, etc.
        logger.info(f"Enterprise contact email prepared for: {contact_data['email']}")
        logger.info(f"Email body:\n{body}")
        
        # For now, just log the email
        # You can implement actual SMTP sending or use an email service
        
    except Exception as e:
        logger.error(f"Error sending enterprise contact email: {str(e)}")
        raise
