# Local Payment Flow Setup Guide

## Issue
When testing payments locally, after completing payment, the page redirects to production URL instead of localhost.

## Solution

The payment redirect URL is controlled by the `FRONTEND_URL` environment variable in the backend.

---

## For Local Development

### Step 1: Update Backend .env

Edit `/app/backend/.env` and change `FRONTEND_URL`:

**Change this:**
```env
FRONTEND_URL=https://bankdoc-nexjs.preview.emergentagent.com
```

**To this:**
```env
FRONTEND_URL=http://localhost:3000
```

### Step 2: Complete Backend .env for Local

Your local `/app/backend/.env` should look like this:

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS (allow localhost)
CORS_ORIGINS="http://localhost:3000"

# Google Gemini API Key
GEMINI_API_KEY=your_api_key_here

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Dodo Payments
DODO_PAYMENTS_API_KEY=your_dodo_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# IMPORTANT: Set to localhost for local development
FRONTEND_URL=http://localhost:3000

# WordPress Blog (optional)
WORDPRESS_BASE_URL=https://your-blog-url.com
```

### Step 3: Create Frontend .env

Create `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Step 4: Restart Backend

```bash
cd /app/backend
# Stop the server (Ctrl+C)
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

---

## Testing Payment Flow

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd /app/frontend
yarn start
```

### Step 2: Test the Flow

1. **Open:** http://localhost:3000
2. **Sign Up/Login** to your account
3. **Click "Upgrade"** button (when you see "1 of 7 pages remaining")
4. **Select a plan** (Starter, Professional, or Enterprise)
5. **Click payment button** - Opens Dodo Payments page
6. **Complete test payment** (use Dodo test card)
7. **After payment:** Redirects to `http://localhost:3000/?payment=success`
8. **See updated credits** on the page

---

## How Payment Flow Works

### 1. User Clicks "Upgrade"
```javascript
// Frontend redirects to /pricing
navigate('/pricing')
```

### 2. User Selects Plan
```javascript
// Frontend calls backend API
POST /api/dodo/create-subscription
{
  "package_id": "starter",
  "billing_interval": "monthly"
}
```

### 3. Backend Creates Payment Session
```python
# Backend: dodo_routes.py
subscription_response = await dodo_client.subscriptions.create(
    return_url=f"{FRONTEND_URL}/?payment=success",  # Uses FRONTEND_URL from .env
    ...
)
```

### 4. User Completes Payment
- Redirected to Dodo Payments page
- Completes payment with test card
- Dodo redirects to: `{FRONTEND_URL}/?payment=success`

### 5. Frontend Shows Success
```javascript
// Frontend: Converter.jsx
useEffect(() => {
  const paymentSuccess = searchParams.get('payment');
  
  if (paymentSuccess === 'success' && isAuthenticated) {
    toast.success('🎉 Payment successful!');
    refreshUser();  // Updates credits
  }
}, [searchParams]);
```

---

## Dodo Test Payment

### Test Card Details (Test Mode):

**Card Number:** `4242 4242 4242 4242`  
**Expiry:** Any future date (e.g., `12/25`)  
**CVC:** Any 3 digits (e.g., `123`)  
**ZIP:** Any 5 digits (e.g., `12345`)

**Note:** This only works in `test_mode`. No real charges are made.

---

## Environment Variables Comparison

### Production (Emergent Platform):
```env
FRONTEND_URL=https://bankdoc-nexjs.preview.emergentagent.com
CORS_ORIGINS="*"
MONGO_URL="mongodb://localhost:27017"  # Internal MongoDB
```

### Local Development:
```env
FRONTEND_URL=http://localhost:3000      # ← Key difference!
CORS_ORIGINS="http://localhost:3000"
MONGO_URL="mongodb://localhost:27017"  # Your local MongoDB
```

---

## Verifying It Works

### Check Backend Logs:

When creating payment, you should see:
```
INFO - Creating Dodo subscription for user email@example.com
INFO - Using return URL: http://localhost:3000/?payment=success
```

If you see the production URL here, your backend `.env` is not updated correctly.

### Check Payment Redirect:

After completing payment on Dodo page:
1. ✅ Should redirect to: `http://localhost:3000/?payment=success`
2. ✅ Should show toast: "🎉 Payment successful!"
3. ✅ Should refresh user data
4. ✅ Should show updated credits: "7 of 7 pages remaining" (or unlimited)

---

## Troubleshooting

### Issue 1: Still Redirecting to Production URL

**Cause:** Backend .env not updated or backend not restarted

**Solution:**
```bash
# 1. Verify .env file
cat /app/backend/.env | grep FRONTEND_URL
# Should show: FRONTEND_URL=http://localhost:3000

# 2. Restart backend
cd /app/backend
# Stop with Ctrl+C
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 3. Check logs when creating payment
# Should show: Using return URL: http://localhost:3000/?payment=success
```

### Issue 2: Credits Not Updating After Payment

**Cause:** Frontend not refreshing user data or webhook not firing

**Solution:**

**Option A: Frontend refresh (simple):**
```javascript
// The code already does this, but you can force it
window.location.reload();
```

**Option B: Check webhook:**
```bash
# Check backend logs for webhook
tail -f /var/log/supervisor/backend.out.log

# Look for:
# "Received webhook event: checkout.session.completed"
# "Successfully updated subscription for user: email@example.com"
```

### Issue 3: Payment Success but No Credits

**Possible causes:**
1. Webhook not configured correctly
2. Database not updating
3. Frontend not refreshing user data

**Debug steps:**
```bash
# 1. Check backend logs
tail -n 100 /var/log/supervisor/backend.err.log

# 2. Check MongoDB
mongosh
use test_database
db.users.find({ email: "your@email.com" })
# Check subscription_tier and pages_remaining fields

# 3. Manually refresh frontend
# Click on "Settings" page and back to converter
# Or refresh browser
```

### Issue 4: CORS Error After Payment Redirect

**Cause:** CORS_ORIGINS not set correctly

**Solution:**
```env
# In backend .env
CORS_ORIGINS="http://localhost:3000"

# Restart backend
```

---

## Quick Setup Checklist

For local development with working payments:

- [ ] MongoDB running locally
- [ ] Backend .env has `FRONTEND_URL=http://localhost:3000`
- [ ] Backend .env has `CORS_ORIGINS="http://localhost:3000"`
- [ ] Backend .env has valid `GEMINI_API_KEY`
- [ ] Backend .env has Dodo Payments credentials
- [ ] Frontend .env has `REACT_APP_BACKEND_URL=http://localhost:8001`
- [ ] Backend running on port 8001
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login/signup
- [ ] Can see "1 of 7 pages remaining" after login
- [ ] Clicking "Upgrade" goes to pricing page
- [ ] Selecting plan opens Dodo payment page
- [ ] After payment, redirects to localhost
- [ ] Credits update after payment

---

## Summary

**Key Point:** The `FRONTEND_URL` in backend `.env` controls where users are redirected after payment.

**For Local:** Set to `http://localhost:3000`  
**For Production:** Set to your production URL

This ensures the payment flow works correctly in both environments!

---

**Last Updated:** November 19, 2024  
**Status:** ✅ Instructions for local payment testing
