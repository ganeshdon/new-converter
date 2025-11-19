# Local Development Setup Guide

## Prerequisites

- **Python 3.9+** installed
- **Node.js 16+** and **Yarn** installed
- **MongoDB** installed and running locally
- **Git** installed

---

## 📁 Project Structure

```
/app/
├── frontend/        # React App
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
└── backend/         # FastAPI Backend
    ├── server.py
    ├── auth.py
    ├── models.py
    ├── requirements.txt
    └── .env
```

---

## 🔧 Backend Setup (FastAPI + MongoDB)

### 1. Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download from: https://www.mongodb.com/try/download/community

### 2. Create Backend Environment File

Create `/app/backend/.env`:

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS
CORS_ORIGINS="http://localhost:3000"

# API Keys
GEMINI_API_KEY=AIzaSyAO5MGBpzVvDdMUJfMk5StAiapxvVvwryY

# Authentication
JWT_SECRET_KEY=super-secret-key-change-in-production-bank-statement-converter-2024
GOOGLE_CLIENT_ID=640479011576-jlk0sceb5lnjsva0q9mg05r09jprp2vd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Payments
DODO_PAYMENTS_API_KEY=NzvS5IynL725XWCv.zbxPW5uYg7SotKCOtrQHTydRlbklYn4D-9n5Am4xYd0BmAT-
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_DijdfKgs55M2h3QZZPhUrKi+tI1kbDzm

# URLs
FRONTEND_URL=http://localhost:3000
WORDPRESS_BASE_URL=https://mediumblue-shrew-791406.hostingersite.com
```

### 3. Create Local Requirements File

Create `/app/backend/requirements-local.txt` (without emergentintegrations):

```txt
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.5.0
python-dotenv==1.1.1
python-multipart==0.0.20
bcrypt==4.0.1
PyJWT==2.10.1
python-jose==3.5.0
passlib==1.7.4
email-validator==2.3.0
httpx==0.28.1
aiohttp==3.12.15
google-generativeai==0.8.5
google-ai-generativelanguage==0.6.15
PyPDF2==3.0.1
pandas==2.3.3
reportlab==4.4.4
openpyxl
dodopayments==1.53.5
pydantic==2.11.9
```

### 4. Install Backend Dependencies

```bash
cd /app/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies (use local requirements)
pip install -r requirements-local.txt
```

### 5. Run Backend Server

```bash
cd /app/backend

# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: **http://localhost:8001**

API docs: **http://localhost:8001/docs**

---

## 🎨 Frontend Setup (React)

### 1. Create Frontend Environment File

Create `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_GOOGLE_CLIENT_ID=640479011576-jlk0sceb5lnjsva0q9mg05r09jprp2vd.apps.googleusercontent.com
```

### 2. Install Frontend Dependencies

```bash
cd /app/frontend

# Install dependencies
yarn install
```

### 3. Run Frontend Server

```bash
cd /app/frontend

# Start development server
yarn start
```

Frontend will be available at: **http://localhost:3000**

---

## 🚀 Running Both Servers

### Terminal 1 - Backend:
```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Terminal 2 - Frontend:
```bash
cd /app/frontend
yarn start
```

---

## 📝 Key Differences from Production

### 1. **emergentintegrations Package**
- **Production:** Uses `emergentintegrations` (Emergent platform package)
- **Local:** Uses `google-generativeai` directly as fallback
- The code automatically detects which one is available

### 2. **URLs**
- **Backend:** `http://localhost:8001` (instead of production URL)
- **Frontend:** `http://localhost:3000` (instead of production URL)

### 3. **MongoDB**
- **Production:** Remote MongoDB instance
- **Local:** Local MongoDB at `mongodb://localhost:27017`

### 4. **CORS**
- **Production:** `*` (all origins)
- **Local:** `http://localhost:3000` (recommended for security)

---

## 🔍 Testing the Application

### 1. Check Backend Health
```bash
curl http://localhost:8001/
```

### 2. Test API Endpoints
Visit: http://localhost:8001/docs

### 3. Test Frontend
Open browser: http://localhost:3000

### 4. Test File Upload
1. Go to http://localhost:3000
2. Upload a PDF bank statement
3. Check backend console for logs
4. Verify converted file downloads

---

## 🐛 Common Issues & Solutions

### Issue 1: "emergentintegrations not found"
**Solution:** This is expected locally. The code will automatically use `google-generativeai` instead.

### Issue 2: "Connection refused on MongoDB"
**Solution:** 
```bash
# Check if MongoDB is running
mongosh  # or mongo

# If not running, start it:
# macOS:
brew services start mongodb-community
# Ubuntu:
sudo systemctl start mongodb
```

### Issue 3: "CORS error" in frontend
**Solution:** Make sure backend `.env` has:
```env
CORS_ORIGINS="http://localhost:3000"
```

### Issue 4: "Module not found" errors in backend
**Solution:** Make sure virtual environment is activated:
```bash
source venv/bin/activate
pip install -r requirements-local.txt
```

### Issue 5: Frontend not connecting to backend
**Solution:** Check frontend `.env` has correct backend URL:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Issue 6: "Gemini API Key error"
**Solution:** Make sure you have a valid Gemini API key in backend `.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```
Get one from: https://makersuite.google.com/app/apikey

---

## 📦 Dependencies Explained

### Backend (Python)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `motor` - Async MongoDB driver
- `google-generativeai` - **Local alternative to emergentintegrations**
- `PyPDF2` - PDF processing
- `pandas` - Data manipulation
- `reportlab` - PDF generation
- `dodopayments` - Payment processing

### Frontend (React)
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `shadcn/ui` components - UI library

---

## 🌐 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8001 | http://localhost:8001 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## 🔐 Environment Variables Quick Reference

### Backend Required:
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `GEMINI_API_KEY` - Google Gemini API key (get from Google AI Studio)
- `JWT_SECRET_KEY` - Secret for JWT tokens
- `CORS_ORIGINS` - Allowed frontend origins

### Frontend Required:
- `REACT_APP_BACKEND_URL` - Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **MongoDB Docs:** https://www.mongodb.com/docs/
- **Tailwind CSS:** https://tailwindcss.com/
- **Google Generative AI:** https://ai.google.dev/

---

## ✅ Quick Start Commands

```bash
# Terminal 1 - Backend
cd /app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-local.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend
cd /app/frontend
yarn install
yarn start

# Open browser
open http://localhost:3000
```

---

**Last Updated:** November 19, 2024  
**Status:** ✅ Ready for Local Development
