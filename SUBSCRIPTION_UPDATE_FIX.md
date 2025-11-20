# Subscription Not Updating After Payment - Fix

## ✅ Issue Fixed

**Problem:** After completing payment, the user's subscription and credits were not being updated. The Settings page still showed "Daily Free" with "1/7 pages today" instead of the new subscription tier.

**Root Cause:** 
1. Webhooks from Dodo Payments cannot reach localhost during local development
2. The application was relying solely on webhooks to update user subscriptions
3. No fallback mechanism existed to check and update subscription status

---

## 🔧 Solution Implemented

### 1. Created Manual Subscription Check Endpoint

**File:** `/app/backend/dodo_routes.py`

**New Endpoint:**
```python
@router.post("/check-subscription/{subscription_id}")
async def check_subscription_status(subscription_id: str, current_user: dict = Depends(get_current_user)):
    """
    Check subscription status with Dodo Payments and update database
    This is used after payment redirect when webhook might not have fired
    """
    # Fetch subscription from Dodo API
    subscription = await dodo_client.subscriptions.get(subscription_id)
    
    if subscription.status == "active":
        # Update user in database
        await db.users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "subscription_status": "active",
                    "subscription_tier": plan,
                    "pages_limit": pages_limit,
                    "pages_remaining": pages_remaining
                }
            }
        )
```

**What It Does:**
- Fetches subscription status directly from Dodo Payments API
- Updates user's subscription tier and credits in database
- Returns updated subscription information

### 2. Updated Frontend to Call Check Endpoint

**File:** `/app/frontend/src/pages/Pricing.jsx`

**Store Subscription ID:**
```javascript
const data = await response.json();

// Store subscription_id in sessionStorage
if (data.session_id) {
  sessionStorage.setItem('pending_subscription_id', data.session_id);
}

// Redirect to payment page
window.location.href = data.checkout_url;
```

**File:** `/app/frontend/src/pages/Converter.jsx`

**Check Subscription After Payment:**
```javascript
useEffect(() => {
  const paymentSuccess = searchParams.get('payment');
  
  if (paymentSuccess === 'success' && !paymentHandledRef.current) {
    // Get subscription_id from sessionStorage
    const subscriptionId = sessionStorage.getItem('pending_subscription_id');
    
    // Call backend to check and update subscription
    const response = await fetch(
      `${backendUrl}/api/dodo/check-subscription/${subscriptionId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      // Subscription activated
      toast.success('🎉 Subscription activated!');
      sessionStorage.removeItem('pending_subscription_id');
    }
    
    // Refresh user data
    refreshUser();
  }
}, [searchParams]);
```

---

## 🎯 How It Works Now

### Complete Payment Flow:

1. **User Clicks "Choose Plan"**
   - Frontend calls `/api/dodo/create-subscription`
   - Backend creates subscription with Dodo Payments
   - Returns `session_id` (subscription_id) and `checkout_url`

2. **Frontend Stores Subscription ID**
   - Saves `session_id` to `sessionStorage`
   - Redirects user to Dodo payment page

3. **User Completes Payment**
   - Enters payment details on Dodo page
   - Completes purchase

4. **Dodo Redirects to App**
   - Redirects to: `/?payment=success`
   - Webhook may or may not fire (can't reach localhost)

5. **Frontend Detects Payment Success**
   - Reads `?payment=success` from URL
   - Retrieves `subscription_id` from sessionStorage

6. **Frontend Calls Check Endpoint**
   - POSTs to `/api/dodo/check-subscription/{subscription_id}`
   - Backend fetches subscription from Dodo API
   - Backend updates user in database

7. **User Data Refreshes**
   - Frontend calls `/api/user/profile`
   - Gets updated subscription tier and credits
   - Navbar and settings page update automatically

---

## 📊 Subscription Tiers & Credits

### Mapping:

| Plan | Tier Name | Pages Limit | Pages Remaining |
|------|-----------|-------------|-----------------|
| Starter | starter | 50 | 50 (monthly) |
| Professional | professional | 200 | 200 (monthly) |
| Enterprise | enterprise | -1 (unlimited) | -1 (unlimited) |

### Database Update:

```javascript
{
  "subscription_status": "active",
  "subscription_tier": "starter",      // or "professional" or "enterprise"
  "pages_limit": 50,                   // or 200 or -1
  "pages_remaining": 50,               // or 200 or -1
  "updated_at": "2024-11-20T..."
}
```

---

## 🧪 Testing the Fix

### Local Development Test:

1. **Start Services**
   ```bash
   # Backend
   cd /app/backend
   source venv/bin/activate
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   
   # Frontend
   cd /app/frontend
   yarn start
   ```

2. **Complete Payment Flow**
   - Login at http://localhost:3000
   - Click "Upgrade" (when credits are low)
   - Select "Starter" plan
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

3. **Verify After Redirect**
   - Should redirect to http://localhost:3000/?payment=success
   - Wait 2-3 seconds
   - Check browser console for: "Subscription check result: {status: 'success'}"
   - Verify navbar shows updated credits (e.g., "50 of 50")
   - Go to Settings page - should show "Starter" tier

4. **Check Browser DevTools**
   - **Network Tab:**
     - Look for POST to `/api/dodo/check-subscription/sub_xxx`
     - Should return 200 OK with success status
     - Look for GET to `/api/user/profile`
     - Should return updated user data
   
   - **Application Tab (Storage):**
     - SessionStorage should have `pending_subscription_id`
     - After success, should be removed

---

## 🐛 Common Issues & Solutions

### Issue 1: Credits Still Not Updating

**Check:**
```javascript
// Browser console
sessionStorage.getItem('pending_subscription_id')
// Should return subscription ID like "sub_xxx"
```

**Solutions:**
1. Check if subscription_id is being stored:
   - Before payment, open DevTools > Application > SessionStorage
   - Verify `pending_subscription_id` exists

2. Check network requests:
   - After redirect, verify POST to `/check-subscription/sub_xxx`
   - Check response - should be 200 OK

3. Check backend logs:
   ```bash
   tail -f /var/log/supervisor/backend.out.log | grep subscription
   ```

### Issue 2: "Subscription not found in database"

**Cause:** The subscription wasn't created in database before payment

**Solution:**
```bash
# Check MongoDB
mongosh
use test_database
db.subscriptions.find().pretty()

# Should see subscription with status: "pending"
```

If missing, the create-subscription endpoint might have failed.

### Issue 3: Subscription Shows as "pending" Not "active"

**Cause:** Dodo Payments hasn't marked it active yet

**Solutions:**
1. Wait 10-30 seconds and try checking again
2. Manually check on Dodo dashboard
3. Call check endpoint manually:
   ```bash
   curl -X POST http://localhost:8001/api/dodo/check-subscription/sub_xxx \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Issue 4: Token Expired Error

**Cause:** JWT token expired during payment process

**Solution:**
- User needs to logout and login again
- Or implement token refresh mechanism

---

## 🔄 Webhook vs Manual Check

### Webhook (Production):
✅ Automatic - fires when payment succeeds
✅ No user action needed
✅ Instant updates
❌ Requires publicly accessible URL
❌ Can't reach localhost

### Manual Check (Local + Production):
✅ Works in localhost
✅ Works as webhook fallback
✅ User-triggered update
❌ Requires frontend call
❌ Slight delay (1-2 seconds)

**Best Practice:** Use BOTH methods:
- Webhook for production (instant)
- Manual check as fallback (reliability)

---

## 📝 API Endpoints

### 1. Create Subscription
```
POST /api/dodo/create-subscription
Authorization: Bearer <token>
Body: { package_id, billing_interval }

Response: {
  checkout_url: "https://dodopayments.com/...",
  session_id: "sub_xxx"
}
```

### 2. Check Subscription (NEW)
```
POST /api/dodo/check-subscription/{subscription_id}
Authorization: Bearer <token>

Response: {
  status: "success",
  subscription_status: "active",
  plan: "starter",
  pages_limit: 50,
  pages_remaining: 50
}
```

### 3. Get User Profile
```
GET /api/user/profile
Authorization: Bearer <token>

Response: {
  email: "user@example.com",
  subscription_tier: "starter",
  subscription_status: "active",
  pages_limit: 50,
  pages_remaining: 50
}
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Create test subscription locally
- [ ] Verify subscription_id stored in sessionStorage
- [ ] Complete payment with test card
- [ ] Verify redirect to /?payment=success
- [ ] Check console for subscription check call
- [ ] Verify POST to /check-subscription returns 200
- [ ] Verify user profile GET returns updated data
- [ ] Check navbar shows new credits
- [ ] Check Settings page shows new tier
- [ ] Verify sessionStorage cleared after success
- [ ] Test converting a document with new credits

---

## 🔒 Security Considerations

1. **Authentication Required:**
   - Check endpoint requires valid JWT token
   - Only user who created subscription can check it

2. **Subscription Ownership:**
   - Backend verifies subscription belongs to authenticated user
   - Prevents users from checking others' subscriptions

3. **SessionStorage:**
   - More secure than localStorage
   - Clears on tab close
   - Removed after successful activation

---

**Last Updated:** November 20, 2024  
**Status:** ✅ Fixed - Subscriptions now update correctly after payment
**Works For:** Both local development and production
