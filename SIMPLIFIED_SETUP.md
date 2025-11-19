# ✅ Simplified Setup - emergentintegrations Removed

## What Changed

I removed all `emergentintegrations` code. Now the app uses **only** `google-generativeai` library directly.

---

## Updated Code

### Backend now uses ONLY google-generativeai:

```python
import google.generativeai as genai

# Configure API
genai.configure(api_key=GEMINI_API_KEY)

# Upload PDF
uploaded_file = genai.upload_file(pdf_path)

# Try models in this order:
models_to_try = [
    'gemini-1.5-flash-latest',  # Fastest
    'gemini-1.5-flash',          # Stable
    'gemini-1.5-pro-latest',     # Latest Pro
    'gemini-1.5-pro'             # Stable Pro
]
```

---

## For Local Development

### 1. Install Dependencies

```bash
cd /app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install from requirements-local.txt (NO emergentintegrations)
pip install -r requirements-local.txt
```

### 2. Get API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### 3. Create .env File

Create `/app/backend/.env`:

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS
CORS_ORIGINS="http://localhost:3000"

# IMPORTANT: Your Gemini API Key
GEMINI_API_KEY=AIzaSy...your_key_here

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Optional (for payments)
DODO_PAYMENTS_API_KEY=your_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your_secret
```

### 4. Run Backend

```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 5. Run Frontend (separate terminal)

```bash
cd /app/frontend

# Install dependencies
yarn install

# Create .env
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Run
yarn start
```

---

## Requirements Files

### For Local: `requirements-local.txt`

```txt
# NO emergentintegrations!

# Core
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.5.0

# Google Generative AI (DIRECT)
google-generativeai==0.8.5
google-ai-generativelanguage==0.6.15

# PDF Processing
PyPDF2==3.0.1
pandas==2.3.3
reportlab==4.4.4
openpyxl

# Auth
bcrypt==4.0.1
PyJWT==2.10.1
python-jose==3.5.0
passlib==1.7.4

# Payments
dodopayments==1.53.5

# Other
python-dotenv==1.1.1
python-multipart==0.0.20
httpx==0.28.1
pydantic==2.11.9
```

---

## Models That Will Be Tried

The code automatically tries these models in order:

| Order | Model Name | Version | Speed | When Used |
|-------|-----------|---------|-------|-----------|
| 1st | `gemini-2.5-flash` | **2.5 Latest** | **Fastest** | **Primary** ✨ |
| 2nd | `gemini-2.5-flash-latest` | 2.5 | Fastest | Alt 2.5 |
| 3rd | `gemini-1.5-flash-latest` | 1.5 | Fast | Fallback 1 |
| 4th | `gemini-1.5-flash` | 1.5 | Fast | Fallback 2 |
| 5th | `gemini-1.5-pro` | 1.5 Pro | Slower | Last resort |

**Whichever model is available will be used automatically!**

**New:** Now using **Gemini 2.5 Flash** (2025 release) as the primary model - faster and more accurate!

---

## Testing

### Test 1: Backend API
```bash
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}
```

### Test 2: Upload PDF
1. Go to http://localhost:3000
2. Upload a small PDF (1-2 pages)
3. Check backend console for logs:
   - "Using google-generativeai for PDF extraction"
   - "Uploading PDF file..."
   - "Successfully initialized model: gemini-1.5-flash-latest"
   - "AI Response received"

---

## Common Issues

### Issue 1: "No module named 'google.generativeai'"

**Solution:**
```bash
pip install google-generativeai
```

### Issue 2: "429 Quota exceeded"

**Solution:** Get a NEW API key:
1. https://aistudio.google.com/app/apikey
2. Create new key
3. Update .env with new key
4. Restart backend

### Issue 3: "API key not valid"

**Solution:** Check your .env file:
```bash
cat /app/backend/.env | grep GEMINI_API_KEY
# Should show: GEMINI_API_KEY=AIza...
```

### Issue 4: "No available Gemini models found"

**Solution:** 
- Your API key might be invalid
- Check quota at: https://aistudio.google.com/app/apikey
- Try getting a fresh API key

---

## File Structure

```
/app/
├── backend/
│   ├── server.py              ← Updated (no emergentintegrations)
│   ├── requirements-local.txt ← Use this for local
│   ├── requirements.txt       ← Has emergentintegrations (ignore for local)
│   └── .env                   ← Create this
│
└── frontend/
    ├── .env                   ← Create this
    ├── package.json
    └── src/
```

---

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd /app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-local.txt
# Create .env with your GEMINI_API_KEY
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend
cd /app/frontend
yarn install
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn start

# Open browser
open http://localhost:3000
```

---

## Verification Checklist

- [ ] MongoDB running locally
- [ ] Backend .env created with GEMINI_API_KEY
- [ ] Backend running on port 8001
- [ ] Frontend .env created with REACT_APP_BACKEND_URL
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can upload PDF and see it processing
- [ ] Check backend logs show "Using google-generativeai"

---

**Status:** ✅ Simplified - No emergentintegrations needed  
**Library:** google-generativeai (direct)  
**Updated:** November 19, 2024
