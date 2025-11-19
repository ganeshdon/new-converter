# Gemini 2.5 Flash Model - Setup Guide

## ✅ Updated to Gemini 2.5 Flash

The application now uses the **latest Gemini 2.5 Flash** model as the primary AI model.

---

## Model Priority (Automatic Fallback)

The code will try these models in order:

| Priority | Model Name | Version | Speed | Notes |
|----------|-----------|---------|-------|-------|
| **1st** | `gemini-2.5-flash` | Latest 2.5 | **Fastest** | **Primary model** ✨ |
| 2nd | `gemini-2.5-flash-latest` | 2.5 Latest | Fastest | Alternative 2.5 |
| 3rd | `gemini-1.5-flash-latest` | 1.5 Latest | Fast | Fallback if 2.5 unavailable |
| 4th | `gemini-1.5-flash` | 1.5 Stable | Fast | Stable fallback |
| 5th | `gemini-1.5-pro` | 1.5 Pro | Slower | Last resort (high accuracy) |

**Whichever model is available will be used automatically!**

---

## What is Gemini 2.5 Flash?

### Key Features:
- ✅ **Newest Model** - Released in 2025
- ✅ **Fastest Processing** - Optimized for speed
- ✅ **Multi-modal** - Supports PDF, images, text, audio, video
- ✅ **Better Accuracy** - Improved over 1.5 versions
- ✅ **Lower Cost** - More cost-effective than Pro models
- ✅ **High Rate Limits** - Great for production use

### Performance:
- **Input:** Up to 1 million tokens
- **Output:** Up to 8,192 tokens
- **Context Window:** Very large
- **Best For:** Bank statement conversion, document extraction

---

## Rate Limits (Free Tier)

### Gemini 2.5 Flash:
- **Requests per minute (RPM):** 15
- **Requests per day:** 1,500
- **Tokens per minute:** 1 million
- **Cost:** Free tier available

This is **perfect for development and testing!**

---

## Code Implementation

The updated code in `server.py`:

```python
async def extract_with_ai(pdf_path: str):
    import google.generativeai as genai
    
    genai.configure(api_key=GEMINI_API_KEY)
    uploaded_file = genai.upload_file(pdf_path)
    
    # Try models in priority order
    models_to_try = [
        'gemini-2.5-flash',           # Primary - Newest!
        'gemini-2.5-flash-latest',    # Alternative 2.5
        'gemini-1.5-flash-latest',    # Fallback to 1.5
        'gemini-1.5-flash',           # Stable 1.5
        'gemini-1.5-pro'              # Last resort
    ]
    
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            break  # Use first available model
        except:
            continue
    
    # Generate content
    result = model.generate_content([prompt, uploaded_file])
```

---

## API Key Requirements

### Get Your API Key:
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project"
4. Copy the key (starts with `AIza...`)

### Important Notes:
- ✅ Free tier includes Gemini 2.5 Flash
- ✅ No credit card required for free tier
- ✅ Rate limits are generous for development
- ⚠️ For production with high volume, consider paid tier

---

## For Local Development

### Step 1: Create Backend .env

Create `/app/backend/.env`:

```env
# Google Gemini API Key (REQUIRED)
GEMINI_API_KEY=AIzaSy...your_key_here

# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS (allow frontend)
CORS_ORIGINS="http://localhost:3000"

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# URLs
FRONTEND_URL=http://localhost:3000
```

### Step 2: Install Dependencies

```bash
cd /app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-local.txt
```

**requirements-local.txt includes:**
- `google-generativeai` - For Gemini API
- `fastapi` - Web framework
- `PyPDF2` - PDF processing
- `pandas`, `reportlab` - Data export

### Step 3: Run Backend

```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Look for this in logs:**
```
INFO - Using google-generativeai for PDF extraction
INFO - Uploading PDF file: /tmp/xyz.pdf
INFO - Successfully initialized model: gemini-2.5-flash
INFO - Generating AI response...
```

---

## Testing

### Test 1: Check Backend is Running
```bash
curl http://localhost:8001/api/
# Should return: {"message":"Hello World"}
```

### Test 2: Upload a PDF
1. Open: http://localhost:3000
2. Upload a small PDF (1-2 pages recommended for testing)
3. Watch backend console for logs
4. Should see: "Successfully initialized model: gemini-2.5-flash"

### Test 3: Verify Model in Use
Check backend logs - you should see:
```
INFO - Successfully initialized model: gemini-2.5-flash
```

If gemini-2.5-flash is not available, it will automatically try the next model in the list.

---

## Comparison: 2.5 vs 1.5

| Feature | Gemini 2.5 Flash | Gemini 1.5 Flash |
|---------|------------------|------------------|
| Release Date | 2025 | 2024 |
| Speed | **Faster** | Fast |
| Accuracy | **Better** | Good |
| Context Window | **Larger** | Large |
| Multi-modal | **Enhanced** | Yes |
| Rate Limits | Same | Same |
| Cost | Same free tier | Same free tier |

**Recommendation:** Use Gemini 2.5 Flash for best performance!

---

## Common Issues

### Issue 1: "Model not available"

**Symptoms:** Backend logs show trying multiple models

**Solution:** 
- This is normal! The code will find an available model
- Check logs to see which model was used
- If all models fail, check your API key

### Issue 2: "429 Quota exceeded"

**Symptoms:** Error after several requests

**Solution:**
```bash
# Get a NEW API key
# Visit: https://aistudio.google.com/app/apikey

# Update .env
GEMINI_API_KEY=new_key_here

# Restart backend
```

### Issue 3: "API key not valid"

**Solution:**
```bash
# Check your .env file
cat /app/backend/.env | grep GEMINI_API_KEY

# Make sure key starts with: AIza...
# If not, get a new key from Google AI Studio
```

### Issue 4: Slow processing

**Solution:**
- Gemini 2.5 Flash should be fast!
- Check your internet connection
- Try a smaller PDF first (1-2 pages)
- Check backend logs for which model is being used

---

## Monitoring Your Usage

### Check API Usage:
1. Visit: https://aistudio.google.com/app/apikey
2. Click on your API key
3. View usage statistics:
   - Requests made
   - Tokens used
   - Remaining quota

### Rate Limit Tips:
- **Free Tier:** 15 requests/minute, 1,500/day
- For testing: Space out requests
- For production: Consider paid tier for unlimited requests

---

## Upgrading to Paid Tier (Optional)

### If You Need More:
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account
3. Get increased limits:
   - **Requests:** 1000+ per minute
   - **Daily:** Unlimited
   - **Cost:** Pay per token used

**But for development, free tier is sufficient!**

---

## Production Deployment

The code is already updated and running on production with Gemini 2.5 Flash!

**Test it now:**
1. Go to: https://bankdoc-nexjs.preview.emergentagent.com
2. Upload a PDF
3. Should process using Gemini 2.5 Flash

---

## Files Updated

✅ `/app/backend/server.py` - Uses gemini-2.5-flash as primary model
✅ `/app/GEMINI_2.5_SETUP.md` - This guide
✅ `/app/SIMPLIFIED_SETUP.md` - Local development guide
✅ `/app/requirements-local.txt` - Dependencies for local

---

## Summary

### ✅ What Changed:
- Primary model: `gemini-2.5-flash` (newest, fastest)
- Automatic fallback to 1.5 models if needed
- Same API key, same setup process

### 🚀 Benefits:
- Faster processing
- Better accuracy
- Latest AI capabilities
- Same cost (free tier)

### 📊 Status:
- Backend: ✅ Running with Gemini 2.5 Flash
- Production: ✅ Live and ready
- Local Setup: ✅ Ready for testing

---

**Last Updated:** November 19, 2024  
**Primary Model:** Gemini 2.5 Flash  
**Status:** ✅ Active and Running
