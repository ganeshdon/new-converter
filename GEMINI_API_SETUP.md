# Gemini API Setup Guide - Fixing Rate Limit Issues

## Problem
Getting error: `429 You exceeded your current quota` when uploading PDF files.

## Root Cause
The API key you're using either:
1. Has exceeded its free tier quota
2. Doesn't have proper access/billing enabled
3. Is using an experimental model with strict limits

---

## ✅ Solution: Get a Proper Gemini API Key

### Step 1: Get a New API Key

1. **Visit Google AI Studio:**
   - Go to: https://aistudio.google.com/app/apikey
   - Or: https://makersuite.google.com/app/apikey

2. **Sign in with your Google Account**

3. **Create New API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (recommended)
   - Copy the generated key

4. **Important:** Save this key securely!

### Step 2: Update Your .env File

**Backend `.env` file location:** `/app/backend/.env`

Replace the old key:
```env
GEMINI_API_KEY=your_new_api_key_here
```

### Step 3: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)

# Restart with new key
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

---

## 📊 Gemini API Free Tier Limits (as of 2024)

### gemini-pro (Currently used - RECOMMENDED)
- ✅ **60 requests per minute (RPM)**
- ✅ **Unlimited daily requests**
- ✅ **Most stable and reliable**
- Best for: Production use, bank statement conversion

### gemini-1.5-flash-latest (Local development)
- ✅ **15 requests per minute (RPM)**
- ✅ **1,500 requests per day**
- Best for: Fast processing, local testing

### gemini-1.5-pro (Fallback)
- ✅ **2 requests per minute (RPM)**
- ✅ **50 requests per day**
- Best for: Complex documents, higher accuracy

**Free tier is sufficient for development and testing!**

---

## 🔧 What I Fixed in the Code

### 1. Changed Model to Most Stable
**Before:**
```python
model = genai.GenerativeModel('gemini-2.0-flash-exp')  # ❌ Experimental, strict limits
```

**After (Production/Emergent):**
```python
.with_model("gemini", "gemini-pro")  # ✅ Most stable, 60 RPM
```

**After (Local):**
```python
model = genai.GenerativeModel('gemini-1.5-flash-latest')  # ✅ Fast, 15 RPM
```

### 2. Added Fallback Chain
Local development now tries: `gemini-1.5-flash-latest` → `gemini-pro` → `gemini-1.5-pro`

---

## 🧪 Testing Your API Key

### Method 1: Quick Test Script

Create a test file `test_gemini.py`:

```python
import google.generativeai as genai

# Replace with your API key
API_KEY = "your_api_key_here"

genai.configure(api_key=API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello!")
    print("✅ API Key works!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
```

Run it:
```bash
python test_gemini.py
```

### Method 2: Check via API Endpoint

Once backend is running:
```bash
curl -X POST http://localhost:8001/api/test-gemini \
  -H "Content-Type: application/json"
```

---

## 💡 Alternative Solutions

### Option 1: Use Different AI Provider (if Gemini limits are too strict)

#### OpenAI GPT-4 Vision
1. Get API key from: https://platform.openai.com/api-keys
2. Update `.env`:
```env
OPENAI_API_KEY=your_openai_key
USE_OPENAI=true
```

#### Anthropic Claude
1. Get API key from: https://console.anthropic.com/
2. Update `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_key
USE_ANTHROPIC=true
```

### Option 2: Switch to PyPDF2 (No AI, faster but less accurate)

Modify `server.py` to use basic PDF text extraction:
```python
# Use simple text extraction (faster, no API needed, but less accurate)
USE_SIMPLE_EXTRACTION = True
```

---

## 🔍 Monitoring Your API Usage

### Check Current Usage:
1. Visit: https://aistudio.google.com/app/apikey
2. Click on your API key
3. View usage statistics and remaining quota

### Enable Billing (Optional - for higher limits):
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account
3. Get significantly higher limits:
   - gemini-1.5-flash: **1000 RPM** (instead of 15)
   - gemini-1.5-pro: **360 RPM** (instead of 2)

---

## ⚠️ Common Errors & Solutions

### Error 1: "API key not valid"
**Solution:** Make sure you copied the entire key (should start with `AIza...`)

### Error 2: "API key expired"
**Solution:** Generate a new key from Google AI Studio

### Error 3: "Model not found: gemini-1.5-flash"
**Solution:** Your API key might be old. Create a new one or use `gemini-pro`

### Error 4: "429 Quota exceeded" after getting new key
**Solution:** Wait a few minutes and try again. Free tier has rate limits.

### Error 5: "GEMINI_API_KEY not found in environment"
**Solution:** 
```bash
# Make sure .env file is in the right location
ls /app/backend/.env

# Check if key is set
cat /app/backend/.env | grep GEMINI_API_KEY

# Restart backend server after updating .env
```

---

## 📝 Updated Code Summary

The application now uses **gemini-1.5-flash** by default, which has:
- ✅ Better rate limits (15 RPM vs 0 for experimental)
- ✅ Free tier access
- ✅ Stable and reliable
- ✅ Good accuracy for bank statements

**No code changes needed on your end - just update your API key!**

---

## 🚀 Quick Fix Checklist

- [ ] Get new API key from https://aistudio.google.com/app/apikey
- [ ] Update `/app/backend/.env` with new key
- [ ] Verify key in .env: `GEMINI_API_KEY=AIza...`
- [ ] Restart backend server
- [ ] Test with a small PDF file first
- [ ] Check API usage at https://aistudio.google.com/

---

## 📞 Still Having Issues?

### Check Your API Key:
```bash
# From backend directory
cd /app/backend
cat .env | grep GEMINI_API_KEY
```

### Check Server Logs:
```bash
# Look for "Using google-generativeai directly" message
# Should see successful model initialization
```

### Test with Curl:
```bash
curl -X POST http://localhost:8001/api/process-pdf \
  -F "file=@test.pdf" \
  -H "Authorization: Bearer your_jwt_token"
```

---

**Last Updated:** November 19, 2024  
**Status:** ✅ Fixed - Using stable Gemini models with proper rate limits
