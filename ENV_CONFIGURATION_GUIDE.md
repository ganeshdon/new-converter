# Environment Variables Configuration Guide

## 📁 Backend Environment Variables

**File Location:** `/app/backend/.env`

```env
# Database Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS Settings
CORS_ORIGINS="*"

# AI Integration (Gemini)
GEMINI_API_KEY=AIzaSyAO5MGBpzVvDdMUJfMk5StAiapxvVvwryY

# Authentication
JWT_SECRET_KEY=super-secret-key-change-in-production-bank-statement-converter-2024

# Google OAuth
GOOGLE_CLIENT_ID=640479011576-jlk0sceb5lnjsva0q9mg05r09jprp2vd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Dodo Payments Integration
DODO_PAYMENTS_API_KEY=NzvS5IynL725XWCv.zbxPW5uYg7SotKCOtrQHTydRlbklYn4D-9n5Am4xYd0BmAT-
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_DijdfKgs55M2h3QZZPhUrKi+tI1kbDzm

# Frontend URL (for redirects and CORS)
FRONTEND_URL=https://bankdoc-nexjs.preview.emergentagent.com

# WordPress Blog Proxy
WORDPRESS_BASE_URL=https://mediumblue-shrew-791406.hostingersite.com
```

---

## 📁 Frontend Environment Variables

**File Location:** `/app/frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://bankdoc-nexjs.preview.emergentagent.com
```

---

## 📋 Variable Descriptions

### Backend Variables

| Variable | Description | Current Value | Usage |
|----------|-------------|---------------|-------|
| **MONGO_URL** | MongoDB connection string | `mongodb://localhost:27017` | Database connection |
| **DB_NAME** | Database name | `test_database` | Active database |
| **CORS_ORIGINS** | Allowed CORS origins | `*` (all) | API access control |
| **GEMINI_API_KEY** | Google Gemini AI API key | Active key | PDF text extraction |
| **JWT_SECRET_KEY** | Secret for JWT tokens | Custom key | User authentication |
| **GOOGLE_CLIENT_ID** | Google OAuth client ID | Active ID | Social login |
| **GOOGLE_CLIENT_SECRET** | Google OAuth secret | Active secret | Social login |
| **DODO_PAYMENTS_API_KEY** | Dodo Payments API key | Active key (test) | Payment processing |
| **DODO_PAYMENTS_ENVIRONMENT** | Payment environment | `test_mode` | Test/Production mode |
| **DODO_PAYMENTS_WEBHOOK_SECRET** | Webhook verification | Active secret | Payment webhooks |
| **FRONTEND_URL** | Frontend application URL | Preview URL | Redirects & CORS |
| **WORDPRESS_BASE_URL** | WordPress blog URL | Hostinger domain | Blog proxy |

### Frontend Variables

| Variable | Description | Current Value | Usage |
|----------|-------------|---------------|-------|
| **NEXT_PUBLIC_BACKEND_URL** | Backend API endpoint | Preview URL | API calls from frontend |

---

## 🔄 For Production Deployment

### Backend .env Updates

```env
# Update these for production:
CORS_ORIGINS="https://yourbankstatementconverter.com"
JWT_SECRET_KEY=<generate-new-secure-key>
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_API_KEY=<production-api-key>
FRONTEND_URL=https://yourbankstatementconverter.com

# Keep these the same:
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
GEMINI_API_KEY=<same-or-production-key>
GOOGLE_CLIENT_ID=<same-or-update>
GOOGLE_CLIENT_SECRET=<same-or-update>
WORDPRESS_BASE_URL=https://mediumblue-shrew-791406.hostingersite.com
```

### Frontend .env.local Updates

```env
# Update for production:
NEXT_PUBLIC_BACKEND_URL=https://yourbankstatementconverter.com
```

---

## 🔐 Security Best Practices

### ⚠️ Never Commit These to Git

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.development
```

### ✅ Secure Key Generation

**Generate new JWT secret:**
```bash
openssl rand -base64 32
```

**Generate random secret:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📊 Service Status

### Current Configuration Status

| Service | Environment | Status |
|---------|-------------|--------|
| MongoDB | Local | ✅ Active |
| Backend API | Preview | ✅ Running |
| Frontend | Preview | ✅ Running |
| Gemini AI | Production | ✅ Active |
| Google OAuth | Production | ✅ Active |
| Dodo Payments | Test Mode | ✅ Active |
| WordPress Blog | Production | ✅ Active |

---

## 🚀 Quick Setup Commands

### Backend
```bash
cd /app/backend
# Environment variables already set in .env
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd /app/frontend
# Environment variables already set in .env.local
yarn dev
```

---

## 🔗 API Endpoints

**Backend Base URL:** `https://bankdoc-nexjs.preview.emergentagent.com`

**Key Endpoints:**
- Authentication: `/api/auth/login`, `/api/auth/signup`
- PDF Conversion: `/api/convert`, `/api/anonymous/convert`
- Documents: `/api/documents`
- Payments: `/api/dodo/create-subscription`
- Blog Proxy: `/api/blog/*`

---

## 📝 Testing Configuration

### Test API Connection

**Backend Health Check:**
```bash
curl https://bankdoc-nexjs.preview.emergentagent.com/api/health
```

**Frontend to Backend:**
```javascript
// In browser console at frontend URL
fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🔄 Environment Variable Loading

### Backend (FastAPI)
```python
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
```

### Frontend (Next.js)
```javascript
// Access in browser
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Server-side only
const privateKey = process.env.PRIVATE_KEY; // Not accessible in browser
```

---

## ⚙️ Configuration Files Location

```
/app/
├── backend/
│   └── .env              ✅ Backend environment variables
│
└── frontend/
    └── .env.local        ✅ Frontend environment variables
```

---

## 🆘 Troubleshooting

### Backend Not Connecting to MongoDB
```bash
# Check MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Verify MONGO_URL in .env
cat /app/backend/.env | grep MONGO_URL
```

### Frontend Can't Reach Backend
```bash
# Check NEXT_PUBLIC_BACKEND_URL
cat /app/frontend/.env.local

# Test backend is reachable
curl $NEXT_PUBLIC_BACKEND_URL/api/health
```

### Payment Integration Issues
```bash
# Verify Dodo Payments configuration
cat /app/backend/.env | grep DODO
```

---

## ✅ All Environment Variables Ready!

Both frontend and backend are properly configured with all necessary environment variables for:
- ✅ Database connection
- ✅ AI integration (Gemini)
- ✅ Authentication (JWT + Google OAuth)
- ✅ Payment processing (Dodo Payments)
- ✅ Blog integration (WordPress)
- ✅ Frontend-Backend communication

No additional configuration needed for development! 🎉
