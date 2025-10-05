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

@api_router.post("/process-pdf")
async def process_pdf_with_ai(file: UploadFile = File(...)):
    """Process PDF bank statement using AI for enhanced accuracy"""
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Process with AI
        extracted_data = await extract_with_ai(tmp_file_path)
        
        # Clean up temp file
        os.unlink(tmp_file_path)
        
        return {"success": True, "data": extracted_data}
        
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

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
