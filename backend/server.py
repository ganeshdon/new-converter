from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import os
from dotenv import load_dotenv
import tempfile
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid
from bson import ObjectId
import logging
from pathlib import Path
from pydantic import BaseModel, Field
import aiohttp
import json

# Import our modules
from auth import get_password_hash, verify_password, create_access_token, verify_token, verify_jwt_token
from models import (
    UserSignup, UserLogin, UserResponse, TokenResponse, DocumentResponse,
    PagesCheckRequest, PagesCheckResponse, SubscriptionTier, SubscriptionPlan,
    UserUpdate, PasswordReset, PasswordChange, BillingInterval, GoogleUserData, UserSession
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
documents_collection = db.documents
subscriptions_collection = db.subscriptions
user_sessions_collection = db.user_sessions

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class BankStatementData(BaseModel):
    accountInfo: dict
    deposits: list
    atmWithdrawals: list
    checksPaid: list
    visaPurchases: Optional[list] = []

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Authentication endpoints
@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """Register a new user"""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    now = datetime.now(timezone.utc)
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": hashed_password,
        "subscription_tier": SubscriptionTier.DAILY_FREE,
        "pages_remaining": 7,  # Daily free tier starts with 7 pages
        "pages_limit": 7,
        "billing_cycle_start": now,
        "daily_reset_time": now,
        "language_preference": "en",
        "created_at": now,
        "updated_at": now
    }
    
    await users_collection.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id, "email": user_data.email})
    
    # Return user data
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        subscription_tier=SubscriptionTier.DAILY_FREE,
        pages_remaining=7,
        pages_limit=7,
        billing_cycle_start=now,
        daily_reset_time=now,
        language_preference="en"
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if daily free user needs reset
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        await check_and_reset_daily_pages(user["_id"])
        user = await users_collection.find_one({"_id": user["_id"]})  # Refresh user data
    
    # Create access token
    access_token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    user_response = UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user["full_name"],
        subscription_tier=user["subscription_tier"],
        pages_remaining=user["pages_remaining"],
        pages_limit=user["pages_limit"],
        billing_cycle_start=user.get("billing_cycle_start"),
        daily_reset_time=user.get("daily_reset_time"),
        language_preference=user.get("language_preference", "en")
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/logout")
async def logout(current_user: dict = Depends(verify_token)):
    """Logout user (client should delete token)"""
    return {"message": "Logged out successfully"}

# Google OAuth Authentication using Emergent Auth
@api_router.get("/auth/oauth/session-data", response_model=UserResponse)
async def get_session_data(request: Request):
    """Process session_id from Emergent Auth and return user data"""
    session_id = request.headers.get("X-Session-ID")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header is required")
    
    try:
        # Call Emergent Auth API to get user data
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            ) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Invalid session ID")
                
                oauth_data = await response.json()
        
        # Check if user exists by email
        existing_user = await users_collection.find_one({"email": oauth_data["email"]})
        
        if existing_user:
            user_id = existing_user["_id"]
            # Update user data if needed (but don't overwrite existing data)
            if not existing_user.get("picture"):
                await users_collection.update_one(
                    {"_id": user_id},
                    {"$set": {"picture": oauth_data.get("picture")}}
                )
        else:
            # Create new user from OAuth data
            user_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            user_doc = {
                "_id": user_id,
                "email": oauth_data["email"],
                "full_name": oauth_data["name"],
                "picture": oauth_data.get("picture"),
                "subscription_tier": SubscriptionTier.DAILY_FREE,
                "pages_remaining": 7,  # Daily free tier starts with 7 pages
                "pages_limit": 7,
                "billing_cycle_start": now,
                "daily_reset_time": now,
                "language_preference": "en",
                "created_at": now,
                "updated_at": now,
                "oauth_provider": "google"
            }
            await users_collection.insert_one(user_doc)
        
        # Create or update session token
        session_token = oauth_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        }
        
        # Upsert session (replace existing or create new)
        await user_sessions_collection.replace_one(
            {"user_id": user_id},
            session_doc,
            upsert=True
        )
        
        # Get updated user data
        user = await users_collection.find_one({"_id": user_id})
        
        return UserResponse(
            id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            subscription_tier=user["subscription_tier"],
            pages_remaining=user["pages_remaining"],
            pages_limit=user["pages_limit"],
            billing_cycle_start=user.get("billing_cycle_start"),
            daily_reset_time=user.get("daily_reset_time"),
            language_preference=user.get("language_preference", "en")
        )
        
    except Exception as e:
        logger.error(f"OAuth session error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process OAuth session")

@api_router.post("/auth/oauth/logout")
async def oauth_logout(request: Request, response: Response):
    """Logout user - delete session and clear cookie"""
    # Try to get session token from cookie first, then from Authorization header
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        # Delete session from database
        await user_sessions_collection.delete_one({"session_token": session_token})
        
        # Clear cookie
        response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    
    return {"message": "Logged out successfully"}

# Helper function to get current user from session token (for OAuth users)
async def get_current_user_from_session(session_token: str) -> Optional[dict]:
    """Get user from session token"""
    session = await user_sessions_collection.find_one({"session_token": session_token})
    if not session or session["expires_at"] < datetime.now(timezone.utc):
        return None
    
    user = await users_collection.find_one({"_id": session["user_id"]})
    if user:
        return {"user_id": user["_id"], "email": user["email"]}
    return None

# Updated auth dependency to support both JWT and OAuth session tokens
async def get_current_user(request: Request):
    """Get current user from JWT token or OAuth session token"""
    # First try to get session token from cookie
    session_token = request.cookies.get("session_token")
    if session_token:
        user = await get_current_user_from_session(session_token)
        if user:
            return user
    
    # Fallback to Authorization header (for both JWT and session tokens)
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    
    # Try as session token first
    user = await get_current_user_from_session(token)
    if user:
        return user
    
    # Try as JWT token
    try:
        return verify_jwt_token(token)
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.get("/user/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    user = await users_collection.find_one({"_id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if daily free user needs reset
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        await check_and_reset_daily_pages(user["_id"])
        user = await users_collection.find_one({"_id": user["_id"]})
    
    return UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user["full_name"],
        subscription_tier=user["subscription_tier"],
        pages_remaining=user["pages_remaining"],
        pages_limit=user["pages_limit"],
        billing_cycle_start=user.get("billing_cycle_start"),
        daily_reset_time=user.get("daily_reset_time"),
        language_preference=user.get("language_preference", "en")
    )

@api_router.put("/user/profile", response_model=UserResponse)
async def update_profile(updates: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await users_collection.update_one(
        {"_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    user = await users_collection.find_one({"_id": current_user["user_id"]})
    return UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user["full_name"],
        subscription_tier=user["subscription_tier"],
        pages_remaining=user["pages_remaining"],
        pages_limit=user["pages_limit"],
        billing_cycle_start=user.get("billing_cycle_start"),
        daily_reset_time=user.get("daily_reset_time"),
        language_preference=user.get("language_preference", "en")
    )

@api_router.post("/user/pages/check", response_model=PagesCheckResponse)
async def check_pages(pages_request: PagesCheckRequest, current_user: dict = Depends(get_current_user)):
    """Check if user has enough pages for conversion"""
    user = await users_collection.find_one({"_id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if daily free user needs reset
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        await check_and_reset_daily_pages(user["_id"])
        user = await users_collection.find_one({"_id": user["_id"]})
    
    can_convert = user["pages_remaining"] >= pages_request.page_count
    
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        daily_reset_time = user["daily_reset_time"]
        if daily_reset_time and daily_reset_time.tzinfo is None:
            daily_reset_time = daily_reset_time.replace(tzinfo=timezone.utc)
        next_reset = daily_reset_time + timedelta(days=1)
        message = f"You have {user['pages_remaining']} pages remaining today. Resets in {(next_reset - datetime.now(timezone.utc)).seconds // 3600} hours."
    else:
        billing_cycle_start = user.get("billing_cycle_start", datetime.now(timezone.utc))
        if billing_cycle_start and billing_cycle_start.tzinfo is None:
            billing_cycle_start = billing_cycle_start.replace(tzinfo=timezone.utc)
        next_reset = billing_cycle_start + timedelta(days=30)
        message = f"You have {user['pages_remaining']} pages remaining this month."
    
    if not can_convert:
        if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
            message = "You've used all your daily pages. Upgrade to continue or wait for reset."
        else:
            message = "You've used all your monthly pages. Upgrade your plan to continue."
    
    return PagesCheckResponse(
        can_convert=can_convert,
        pages_remaining=user["pages_remaining"],
        pages_limit=user["pages_limit"],
        reset_date=next_reset,
        message=message
    )

@api_router.post("/process-pdf")
async def process_pdf_with_ai(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Process PDF bank statement using AI for enhanced accuracy"""
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # First count pages in the PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Count pages (simple implementation - you can enhance this)
        page_count = await count_pdf_pages(tmp_file_path)
        
        # Check if user has enough pages
        user = await users_collection.find_one({"_id": current_user["user_id"]})
        if user["pages_remaining"] < page_count:
            os.unlink(tmp_file_path)
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient pages. You need {page_count} pages but only have {user['pages_remaining']} remaining."
            )
        
        # Process with AI
        extracted_data = await extract_with_ai(tmp_file_path)
        
        # Deduct pages after successful conversion
        await users_collection.update_one(
            {"_id": current_user["user_id"]},
            {"$inc": {"pages_remaining": -page_count}}
        )
        
        # Save document record
        doc_id = str(uuid.uuid4())
        document_doc = {
            "_id": doc_id,
            "user_id": current_user["user_id"],
            "original_filename": file.filename,
            "file_size": len(content),
            "page_count": page_count,
            "pages_deducted": page_count,
            "conversion_date": datetime.now(timezone.utc),
            "download_count": 0,
            "status": "completed"
        }
        await documents_collection.insert_one(document_doc)
        
        # Clean up temp file
        os.unlink(tmp_file_path)
        
        return {"success": True, "data": extracted_data, "pages_used": page_count}
        
    except Exception as e:
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
        logger.error(f"PDF processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@api_router.get("/documents", response_model=List[DocumentResponse])
async def get_documents(current_user: dict = Depends(get_current_user)):
    """Get user's document history"""
    documents = await documents_collection.find(
        {"user_id": current_user["user_id"]}
    ).sort("conversion_date", -1).to_list(length=100)
    
    return [DocumentResponse(
        id=doc["_id"],
        original_filename=doc["original_filename"],
        file_size=doc["file_size"],
        page_count=doc["page_count"],
        pages_deducted=doc["pages_deducted"],
        conversion_date=doc["conversion_date"],
        download_count=doc.get("download_count", 0),
        status=doc["status"]
    ) for doc in documents]

@api_router.get("/documents/{doc_id}/download")
async def download_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Download converted document (mock implementation)"""
    document = await documents_collection.find_one({
        "_id": doc_id,
        "user_id": current_user["user_id"]
    })
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # In a real implementation, you'd retrieve the actual converted file
    # For now, we'll return a sample CSV
    sample_csv = """Account Summary,Value,
Account Number,000009752,
Statement Date,June 5 2003,
Beginning Balance,$7126.11,
Ending Balance,$10521.19,"""
    
    # Update download count
    await documents_collection.update_one(
        {"_id": doc_id},
        {"$inc": {"download_count": 1}}
    )
    
    from fastapi.responses import Response
    return Response(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={document['original_filename'].replace('.pdf', '-converted.csv')}"}
    )

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    """Delete a document"""
    result = await documents_collection.delete_one({
        "_id": doc_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted successfully"}

@api_router.get("/pricing/plans")
async def get_pricing_plans():
    """Get available pricing plans"""
    plans = [
        {
            "tier": "daily_free",
            "name": "Daily Free",
            "price_monthly": 0,
            "price_annual": 0,
            "pages_limit": 7,
            "features": ["7 pages per day", "Resets every 24 hours", "Basic support"],
            "is_popular": False
        },
        {
            "tier": "basic",
            "name": "Basic Plan", 
            "price_monthly": 13.99,
            "price_annual": 11.19,
            "pages_limit": 500,
            "features": ["500 pages per month", "Email support", "30-day history"],
            "is_popular": True
        },
        {
            "tier": "premium",
            "name": "Premium Plan",
            "price_monthly": 27.99,
            "price_annual": 22.39,
            "pages_limit": 1100,
            "features": ["1,100 pages per month", "Priority support", "90-day history"],
            "is_popular": False
        },
        {
            "tier": "platinum",
            "name": "Platinum Plan",
            "price_monthly": 49.99,
            "price_annual": 39.99,
            "pages_limit": 4500,
            "features": ["4,500 pages per month", "Priority support", "API access"],
            "is_popular": False
        },
        {
            "tier": "enterprise",
            "name": "Enterprise Plan",
            "price_monthly": -1,  # Custom pricing
            "price_annual": -1,
            "pages_limit": -1,  # Unlimited
            "features": ["Unlimited pages", "Custom integrations", "Dedicated support"],
            "is_popular": False
        }
    ]
    return plans

async def count_pdf_pages(pdf_path: str) -> int:
    """Count pages in PDF file"""
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return len(reader.pages)
    except Exception as e:
        print(f"Error counting PDF pages: {e}")
        return 1  # Default to 1 page if counting fails

async def check_and_reset_daily_pages(user_id: str):
    """Check if daily free tier user needs page reset"""
    user = await users_collection.find_one({"_id": user_id})
    if not user or user["subscription_tier"] != SubscriptionTier.DAILY_FREE:
        return
    
    now = datetime.now(timezone.utc)
    last_reset = user.get("daily_reset_time", now)
    
    # Ensure last_reset has timezone info
    if last_reset and last_reset.tzinfo is None:
        last_reset = last_reset.replace(tzinfo=timezone.utc)
    
    # Check if 24 hours have passed
    if (now - last_reset).total_seconds() >= 24 * 3600:  # 24 hours
        await users_collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "pages_remaining": 7,  # Reset to 7 pages
                    "daily_reset_time": now
                }
            }
        )

async def extract_with_ai(pdf_path: str):
    """Use OpenAI to extract bank statement data from PDF"""
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
        
        # Initialize AI chat with your Gemini API key
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=f"pdf-extraction-{os.urandom(8).hex()}",
            system_message="""You are a specialized bank statement data extraction expert. 
            Your task is to extract ALL transaction data from PDF bank statements with 100% accuracy.
            
            Extract and return data in this exact JSON structure:
            {
              "accountInfo": {
                "accountNumber": "string",
                "statementDate": "string", 
                "beginningBalance": number,
                "endingBalance": number
              },
              "deposits": [
                {
                  "dateCredited": "MM-DD format",
                  "description": "full description",
                  "amount": number
                }
              ],
              "atmWithdrawals": [
                {
                  "tranDate": "MM-DD format",
                  "datePosted": "MM-DD format", 
                  "description": "full description",
                  "amount": negative_number
                }
              ],
              "checksPaid": [
                {
                  "datePaid": "MM-DD format",
                  "checkNumber": "string",
                  "amount": number,
                  "referenceNumber": "string"
                }
              ],
              "visaPurchases": [
                {
                  "tranDate": "MM-DD format",
                  "datePosted": "MM-DD format",
                  "description": "full description", 
                  "amount": negative_number
                }
              ]
            }
            
            CRITICAL REQUIREMENTS:
            - Extract ALL transactions with exact amounts, dates, and descriptions
            - Use exact date formats (MM-DD like "05-15")
            - Negative amounts for withdrawals/debits
            - Include complete descriptions and reference numbers
            - Return ONLY valid JSON, no additional text"""
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Prepare PDF file for processing
        pdf_file = FileContentWithMimeType(
            file_path=pdf_path,
            mime_type="application/pdf"
        )
        
        # Create message with PDF attachment
        user_message = UserMessage(
            text="Extract ALL bank statement transaction data from this PDF with complete accuracy. Return only the JSON structure specified in the system message.",
            file_contents=[pdf_file]
        )
        
        # Get AI response
        response = await chat.send_message(user_message)
        logger.info(f"AI Response: {response}")
        
        # Parse JSON response
        import json
        try:
            # Clean response and extract JSON
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
            
            extracted_data = json.loads(response_text)
            return extracted_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Raw response: {response}")
            raise Exception("AI returned invalid JSON format")
            
    except Exception as e:
        logger.error(f"AI extraction error: {str(e)}")
        raise Exception(f"AI extraction failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
