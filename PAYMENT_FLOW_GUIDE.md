# Payment Flow & Navigation Guide

## ✅ Changes Made

### 1. Added "Home" Link to Navbar
- **Public users:** Home | Pricing | Login | Register
- **Authenticated users:** Home | Pricing | Pages (X of Y) | Documents | Settings | Sign out

### 2. Home Route Points to Converter Page
- Route: `/` → Shows the main converter page
- After payment, user is redirected to: `/?payment=success`
- User stays logged in throughout the process

### 3. Updated Payment Success Handling
- Shows success toast message
- Automatically refreshes user data to get updated credits
- Stays on home page (doesn't logout)
- Displays updated credit count in navbar

---

## Complete Payment Flow

### Step-by-Step User Journey:

1. **User Lands on Home** (`/`)
   - Anonymous users see: "You have 1 free conversion available!"
   - Logged-in users see: "1 of 7 pages remaining" (or current count)

2. **User Uses Credits**
   - Converts PDF documents
   - Credits decrease with each conversion

3. **User Clicks "Upgrade"**
   - Button appears when: `pages_remaining <= 2` for daily_free users
   - Navigates to: `/pricing`

4. **User Selects Plan**
   - Starter: $9.99/month
   - Professional: $19.99/month  
   - Enterprise: $49.99/month
   - Clicks "Choose Plan" button

5. **Backend Creates Payment Session**
   ```javascript
   POST /api/dodo/create-subscription
   {
     "package_id": "starter",
     "billing_interval": "monthly"
   }
   ```
   
   Backend responds with:
   ```javascript
   {
     "subscription_id": "sub_xxx",
     "payment_link": "https://dodopayments.com/checkout/xxx"
   }
   ```

6. **User Redirected to Dodo Payments**
   - Opens in same window
   - User enters payment details
   - Completes purchase

7. **After Payment Success**
   - Dodo redirects to: `http://localhost:3000/?payment=success` (local)
   - Or: `https://your-domain.com/?payment=success` (production)

8. **Home Page Handles Success**
   ```javascript
   // Converter.jsx
   useEffect(() => {
     const paymentSuccess = searchParams.get('payment');
     
     if (paymentSuccess === 'success') {
       // Show success message
       toast.success('🎉 Payment successful!');
       
       // Refresh user data after 1 second
       setTimeout(() => refreshUser(), 1000);
       
       // Clean URL after 1.5 seconds
       setTimeout(() => {
         window.history.replaceState({}, '', '/');
       }, 1500);
     }
   }, [searchParams]);
   ```

9. **User Sees Updated Credits**
   - Navbar updates automatically
   - Shows new credit count or "Unlimited"
   - User stays logged in
   - Can immediately start converting again

---

## For Local Development

### Backend .env Configuration:

```env
# IMPORTANT: Set this to localhost for local testing
FRONTEND_URL=http://localhost:3000

# Other required settings
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="http://localhost:3000"
GEMINI_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key

# Dodo Payments (test mode)
DODO_PAYMENTS_API_KEY=your_dodo_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend .env Configuration:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Testing Payment Flow Locally:

**Step 1: Start Both Servers**
```bash
# Terminal 1 - Backend
cd /app/backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend
cd /app/frontend
yarn start
```

**Step 2: Test Flow**
1. Open: `http://localhost:3000`
2. Sign up / Login
3. Upload a few PDFs to use credits
4. Click "Upgrade" when you see low credits
5. Select a plan on pricing page
6. Use test card: **4242 4242 4242 4242**
7. Complete payment
8. Verify redirect to: `http://localhost:3000/?payment=success`
9. Check navbar shows updated credits
10. Verify you're still logged in

---

## Credit Display Logic

### Anonymous Users:
```
"You have 1 free conversion available!"
```

### Logged-in Free Users (daily_free):
```
"1 of 7 pages remaining"  (resets daily)
```

### Subscribed Users:
```
Starter: "50 of 50 pages remaining"
Professional: "200 of 200 pages remaining"
Enterprise: "Unlimited"
```

---

## Key Files Modified

### 1. Header.jsx
**Changes:**
- Added "Home" link to public navigation
- Added "Home" link to authenticated navigation
- Added "Home" link to mobile menu (both states)

**Code:**
```javascript
// Public Nav
<Link to="/" className="text-gray-700 hover:text-blue-600">
  Home
</Link>

// Authenticated Nav
<Link to="/" className="text-gray-700 hover:text-blue-600">
  Home
</Link>
```

### 2. Converter.jsx
**Changes:**
- Updated payment success handling
- Added delay for webhook processing
- Improved user data refresh timing
- Better URL cleanup

**Code:**
```javascript
useEffect(() => {
  const paymentSuccess = searchParams.get('payment');
  
  if (paymentSuccess === 'success') {
    toast.success('🎉 Payment successful!');
    
    if (isAuthenticated && refreshUser) {
      setTimeout(() => refreshUser(), 1000);
    }
    
    setTimeout(() => {
      window.history.replaceState({}, '', '/');
    }, 1500);
  }
}, [searchParams, isAuthenticated, refreshUser]);
```

### 3. App.js
**No changes needed** - Already has:
```javascript
<Route path="/" element={<Converter />} />
```

---

## Troubleshooting

### Issue 1: User Gets Logged Out After Payment

**Symptoms:** After payment redirect, user is not logged in

**Causes:**
- JWT token expired
- Auth token not in localStorage
- Session cookies lost

**Solutions:**
```javascript
// Check token in browser console
localStorage.getItem('auth_token')

// Check if user object exists
console.log(user)

// Manually refresh
refreshUser()
```

### Issue 2: Credits Not Updating

**Symptoms:** Payment successful but credits still show old value

**Causes:**
- Webhook not firing
- Webhook processing delay
- Frontend not refreshing

**Solutions:**
1. Wait 5-10 seconds and refresh page
2. Check backend logs for webhook:
   ```bash
   tail -f /var/log/supervisor/backend.out.log | grep webhook
   ```
3. Check database directly:
   ```bash
   mongosh
   use test_database
   db.users.find({ email: "your@email.com" })
   ```

### Issue 3: Redirects to Production URL

**Symptoms:** After payment, redirects to production instead of localhost

**Solution:**
```bash
# Check backend .env
cat /app/backend/.env | grep FRONTEND_URL

# Should show:
FRONTEND_URL=http://localhost:3000

# If not, update it and restart backend
```

### Issue 4: "Upgrade" Button Not Showing

**Symptoms:** Can't find the upgrade button

**Conditions for button to show:**
- User must be logged in
- User must have `subscription_tier === 'daily_free'`
- User must have `pages_remaining <= 2`

**Test:**
```javascript
// Check in browser console
console.log(user.subscription_tier)
console.log(user.pages_remaining)
```

---

## Testing Checklist

- [ ] "Home" link visible in navbar (logged out)
- [ ] "Home" link visible in navbar (logged in)
- [ ] Clicking "Home" goes to converter page
- [ ] Credits display correctly in navbar
- [ ] "Upgrade" button shows when credits low
- [ ] Clicking "Upgrade" goes to /pricing
- [ ] Can select a plan on pricing page
- [ ] Payment page opens correctly
- [ ] After payment, redirects to `/?payment=success`
- [ ] Success toast message shows
- [ ] User stays logged in
- [ ] Credits update in navbar (after 1-2 seconds)
- [ ] Can immediately convert more documents

---

## API Endpoints Used

### Payment Creation:
```
POST /api/dodo/create-subscription
Authorization: Bearer <token>
Body: { package_id, billing_interval }
Response: { subscription_id, payment_link }
```

### Webhook Handler:
```
POST /api/dodo/webhook
Headers: dodo-signature
Body: { type: "checkout.session.completed", data: {...} }
```

### User Profile:
```
GET /api/user/profile
Authorization: Bearer <token>
Response: { email, subscription_tier, pages_remaining, ... }
```

---

## Environment Variables Summary

| Variable | Local Value | Production Value |
|----------|-------------|------------------|
| FRONTEND_URL | `http://localhost:3000` | `https://your-domain.com` |
| CORS_ORIGINS | `http://localhost:3000` | `*` or specific domain |
| REACT_APP_BACKEND_URL | `http://localhost:8001` | Production backend URL |
| DODO_PAYMENTS_ENVIRONMENT | `test_mode` | `live_mode` or `test_mode` |

---

**Last Updated:** November 20, 2024  
**Status:** ✅ Complete - Home navigation and payment flow working
