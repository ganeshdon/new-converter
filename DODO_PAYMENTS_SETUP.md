# Dodo Payments Integration Setup Guide

## Overview
This application now uses Dodo Payments for subscription management, replacing the previous Stripe integration.

## Backend Configuration

### Environment Variables (.env)
```
DODO_PAYMENTS_API_KEY=NzvS5IynL725XWCv.zbxPW5uYg7SotKCOtrQHTydRlbklYn4D-9n5Am4xYd0BmAT-
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=(to be configured after webhook creation)
FRONTEND_URL=https://yourbankstatementconverter.com
```

**Important:** The `FRONTEND_URL` variable is used for redirect URLs after payment. Make sure it's set to your production domain.

### Product IDs
**Monthly Plans:**
- Starter: `pdt_tfooh1hgdtu28iMdXSRl3` ($15/month)
- Professional: `pdt_q0ZUGAq69LZ4vNUZGYjFS` ($30/month)
- Business: `pdt_FInGMoMySf6lYrxia8qgq` ($50/month)

**Annual Plans:**
- Starter: `pdt_uO0U9F22GbAd87C6S7CzG`
- Professional: `pdt_eewWmwQNJ26eMyvhRoG62`
- Business: `pdt_rQiqTXDkiarEO0HW4WrIS`

## Webhook Setup Instructions

### Step 1: Create Webhook in Dodo Dashboard
1. Log into your Dodo Payments dashboard: https://app.dodopayments.com/
2. Navigate to **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Configure the webhook:
   - **Webhook URL**: `https://yourbankstatementconverter.com/api/webhook/dodo`
   - **Events to Subscribe**:
     - `subscription.active`
     - `subscription.renewed`
     - `subscription.on_hold`
     - `subscription.cancelled`
     - `subscription.failed`
     - `payment.succeeded`

### Step 2: Copy Webhook Secret
1. After creating the webhook, copy the **Webhook Secret Key**
2. Add it to your backend `.env` file:
   ```
   DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
   ```
3. Restart the backend: `sudo supervisorctl restart backend`

### Step 3: Test Webhook
1. Use Dodo's webhook testing tool in the dashboard
2. Send a test event
3. Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
4. Verify the event is received and processed successfully

## API Endpoints

### 1. Create Subscription
**POST** `/api/dodo/create-subscription`

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "package_id": "starter",
  "billing_interval": "monthly"
}
```

**Response:**
```json
{
  "checkout_url": "https://pay.dodopayments.com/...",
  "session_id": "sub_..."
}
```

### 2. Create Customer Portal Session
**POST** `/api/dodo/create-portal-session`

**Headers:**
```
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "portal_url": "https://portal.dodopayments.com/..."
}
```

### 3. Enterprise Contact Form
**POST** `/api/enterprise-contact`

**Body:**
```json
{
  "name": "John Doe",
  "company_name": "Acme Corp",
  "website": "https://acme.com",
  "phone": "+1234567890",
  "email": "john@acme.com",
  "message": "Interested in Enterprise plan"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Your request has been submitted. We'll contact you soon!"
}
```

## Webhook Events Handled

### subscription.active
- Activates user subscription
- Updates subscription status to "active"
- Updates user's subscription tier

### subscription.renewed
- Records subscription renewal
- Updates last_renewed_at timestamp

### subscription.on_hold
- Sets subscription status to "on_hold"
- User retains access until grace period ends

### subscription.cancelled
- Marks subscription as cancelled
- User loses access immediately or at period end

### subscription.failed
- Records failed subscription attempt
- Triggers notification (if configured)

### payment.succeeded
- Records successful payment transaction
- Updates payment history

## Database Collections

### subscriptions
```javascript
{
  user_id: "uuid",
  subscription_id: "sub_xxx",
  plan: "starter|professional|business",
  billing_interval: "monthly|annual",
  status: "pending|active|on_hold|cancelled|failed",
  customer_id: "cus_xxx",
  payment_provider: "dodo",
  created_at: Date,
  updated_at: Date,
  activated_at: Date,
  last_renewed_at: Date,
  cancelled_at: Date
}
```

### payment_transactions
```javascript
{
  payment_id: "pay_xxx",
  subscription_id: "sub_xxx",
  amount: 15.00,
  status: "succeeded",
  payment_provider: "dodo",
  created_at: Date
}
```

### enterprise_contacts
```javascript
{
  name: "John Doe",
  company_name: "Acme Corp",
  website: "https://acme.com",
  phone: "+1234567890",
  email: "john@acme.com",
  message: "...",
  submitted_at: Date,
  status: "pending|contacted|closed"
}
```

## Testing in Test Mode

1. All API calls use test mode credentials
2. No real payments are processed
3. Use Dodo's test card numbers for testing checkouts
4. Switch to `live_mode` when ready for production

## Migration from Stripe

All Stripe code has been removed:
- ✅ Removed Stripe checkout integration
- ✅ Removed Stripe webhook handler
- ✅ Removed emergentintegrations stripe dependency
- ✅ Added Dodo Payments SDK
- ✅ Implemented new payment flow
- ✅ Added webhook handling

## Frontend Updates Needed

1. Update Pricing page to call `/api/dodo/create-subscription`
2. Replace Stripe checkout redirect with Dodo payment link
3. Add Enterprise contact form modal
4. Update subscription management to use Dodo portal
5. Remove all Stripe references

## Support

For Dodo Payments support:
- Documentation: https://docs.dodopayments.com/
- Dashboard: https://app.dodopayments.com/
- Support: Contact via dashboard

## Security Notes

- ✅ Webhook signature verification implemented
- ✅ API keys stored in environment variables
- ✅ User authentication required for all payment operations
- ✅ Test mode enabled for safe testing
- ⚠️ Remember to update webhook secret after creating webhook
- ⚠️ Switch to live_mode only when ready for production
