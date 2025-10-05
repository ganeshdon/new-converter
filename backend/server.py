from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends
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

# Import our modules
from auth import get_password_hash, verify_password, create_access_token, verify_token
from models import (
    UserSignup, UserLogin, UserResponse, TokenResponse, DocumentResponse,
    PagesCheckRequest, PagesCheckResponse, SubscriptionTier, SubscriptionPlan,
    UserUpdate, PasswordReset, PasswordChange, BillingInterval
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

@api_router.get("/user/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(verify_token)):
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
async def update_profile(updates: UserUpdate, current_user: dict = Depends(verify_token)):
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
async def check_pages(request: PagesCheckRequest, current_user: dict = Depends(verify_token)):
    """Check if user has enough pages for conversion"""
    user = await users_collection.find_one({"_id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if daily free user needs reset
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        await check_and_reset_daily_pages(user["_id"])
        user = await users_collection.find_one({"_id": user["_id"]})
    
    can_convert = user["pages_remaining"] >= request.page_count
    
    if user["subscription_tier"] == SubscriptionTier.DAILY_FREE:
        next_reset = user["daily_reset_time"] + timedelta(days=1)
        message = f"You have {user['pages_remaining']} pages remaining today. Resets in {(next_reset - datetime.now(timezone.utc)).seconds // 3600} hours."
    else:
        next_reset = user.get("billing_cycle_start", datetime.now(timezone.utc)) + timedelta(days=30)
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
async def process_pdf_with_ai(file: UploadFile = File(...), current_user: dict = Depends(verify_token)):
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

async def count_pdf_pages(pdf_path: str) -> int:
    """Count pages in a PDF file"""
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            return len(pdf_reader.pages)
    except Exception as e:
        logger.warning(f"Could not count PDF pages: {e}")
        return 1  # Default to 1 page if counting fails

async def check_and_reset_daily_pages(user_id: str):
    """Check if daily free user needs page reset"""
    user = await users_collection.find_one({"_id": user_id})
    if not user or user["subscription_tier"] != SubscriptionTier.DAILY_FREE:
        return
    
    now = datetime.now(timezone.utc)
    last_reset = user.get("daily_reset_time", user.get("created_at", now))
    
    # Check if 24 hours have passed since last reset
    if now - last_reset >= timedelta(days=1):
        await users_collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "pages_remaining": 7,  # Reset to daily limit
                    "daily_reset_time": now
                }
            }
        )

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
