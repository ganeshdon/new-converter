# Python Backend - Standalone Run Guide

## 🚀 How to Run Python Backend Separately

### ✅ Prerequisites

1. **Python 3.8+** installed
2. **MongoDB** running on localhost:27017
3. **All dependencies** installed
4. **Environment variables** configured

---

## 📋 Method 1: Using Uvicorn (Recommended)

### Basic Command
```bash
cd /app/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### With Auto-Reload (Development)
```bash
cd /app/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### With Custom Workers (Production)
```bash
cd /app/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

### With Logging
```bash
cd /app/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --log-level info
```

---

## 📋 Method 2: Using Supervisor (Current Setup)

### Check Current Status
```bash
sudo supervisorctl status backend
```

### Start Backend
```bash
sudo supervisorctl start backend
```

### Stop Backend
```bash
sudo supervisorctl stop backend
```

### Restart Backend
```bash
sudo supervisorctl restart backend
```

### View Logs
```bash
# Error logs
tail -f /var/log/supervisor/backend.err.log

# Output logs
tail -f /var/log/supervisor/backend.out.log

# Last 100 lines
tail -n 100 /var/log/supervisor/backend.err.log
```

---

## 📋 Method 3: Direct Python Execution

### Create a run script
```bash
cd /app/backend
cat > run.py << 'EOF'
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
EOF

# Run it
python3 run.py
```

---

## 📋 Method 4: Using Gunicorn (Production)

### Install Gunicorn
```bash
cd /app/backend
pip install gunicorn
```

### Run with Gunicorn
```bash
cd /app/backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

---

## 🔧 Step-by-Step Setup

### 1. Navigate to Backend Directory
```bash
cd /app/backend
```

### 2. Create/Activate Virtual Environment (Optional)
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Verify Environment Variables
```bash
# Check .env file exists
cat .env

# Required variables:
# MONGO_URL
# DB_NAME
# JWT_SECRET_KEY
# GEMINI_API_KEY
# etc.
```

### 5. Check MongoDB is Running
```bash
# Test MongoDB connection
mongosh --eval "db.runCommand({ ping: 1 })"

# Or
mongo --eval "db.runCommand({ ping: 1 })"
```

### 6. Run the Backend
```bash
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## ✅ Verify Backend is Running

### Check if Port is Open
```bash
lsof -i :8001
# or
netstat -tlnp | grep 8001
```

### Test with Curl
```bash
# Health check
curl http://localhost:8001/

# API documentation
curl http://localhost:8001/docs

# Or open in browser:
# http://localhost:8001/docs
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8001
lsof -ti:8001

# Kill the process
kill -9 $(lsof -ti:8001)

# Or use different port
python3 -m uvicorn server:app --host 0.0.0.0 --port 8002
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check if all modules exist
python3 -c "import fastapi; import motor; print('OK')"
```

### Environment Variables Not Found
```bash
# Check .env file
cat /app/backend/.env

# Verify loading
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('MONGO_URL'))"
```

---

## 📊 Backend Server Information

### Current Configuration
- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Default Port:** 8001
- **Host:** 0.0.0.0 (all interfaces)
- **Database:** MongoDB (localhost:27017)
- **Database Name:** test_database

### Key Files
- **Main Server:** `/app/backend/server.py`
- **Auth Module:** `/app/backend/auth.py`
- **Models:** `/app/backend/models.py`
- **Dodo Payments:** `/app/backend/dodo_routes.py`
- **Environment:** `/app/backend/.env`
- **Dependencies:** `/app/backend/requirements.txt`

### API Endpoints
- **Docs:** http://localhost:8001/docs
- **OpenAPI:** http://localhost:8001/openapi.json
- **Health:** http://localhost:8001/
- **Auth:** http://localhost:8001/api/auth/*
- **Convert:** http://localhost:8001/api/convert
- **Documents:** http://localhost:8001/api/documents
- **Payments:** http://localhost:8001/api/dodo/*
- **Blog Proxy:** http://localhost:8001/api/blog/*

---

## 🔄 Background Execution

### Run in Background (Linux)
```bash
cd /app/backend
nohup python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
```

### Check Background Process
```bash
ps aux | grep uvicorn
```

### Stop Background Process
```bash
pkill -f "uvicorn server:app"
```

---

## 📝 Quick Start Commands

### Development Mode
```bash
cd /app/backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Production Mode
```bash
cd /app/backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

### With Supervisor
```bash
sudo supervisorctl restart backend
```

---

## 🎯 Testing Backend

### Test Authentication
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123","confirm_password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Health Check
```bash
curl http://localhost:8001/
```

---

## 📦 Complete Setup Script

```bash
#!/bin/bash

# Setup and Run Backend
cd /app/backend

# Install dependencies (if not installed)
pip install -r requirements.txt

# Check MongoDB
mongosh --eval "db.runCommand({ ping: 1 })"

# Check environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Kill any existing process on port 8001
kill -9 $(lsof -ti:8001) 2>/dev/null

# Run backend
echo "Starting backend on http://localhost:8001"
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Save as `start_backend.sh` and run:
```bash
chmod +x start_backend.sh
./start_backend.sh
```

---

## ✅ Success Indicators

When backend is running successfully, you'll see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Connected to MongoDB successfully
INFO:     Application startup complete.
```

---

## 🔗 Useful URLs

- **API Docs (Swagger):** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc
- **OpenAPI JSON:** http://localhost:8001/openapi.json

---

## 📞 Support

If you encounter issues:
1. Check MongoDB is running
2. Verify .env file exists and is correct
3. Check logs: `tail -f /var/log/supervisor/backend.err.log`
4. Verify port 8001 is not in use
5. Ensure all dependencies are installed

**Backend is ready to run!** 🚀
