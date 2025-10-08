# Bank Statement Converter - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: Set up a MongoDB database (free tier available)
4. **API Keys**: Gather all required API keys (see .env.example)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Bank Statement Converter"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/bank-statement-converter.git
git push -u origin main
```

### 2. Set up MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)

### 3. Deploy to Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel --prod
```

### 4. Configure Environment Variables in Vercel

In your Vercel dashboard > Project > Settings > Environment Variables, add:

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/bankstatements
DB_NAME=bankstatements
JWT_SECRET_KEY=your-super-secret-jwt-key-here
GEMINI_API_KEY=AIzaSyAO5MGBpzVvDdMUJfMk5StAiapxvVvwryY
STRIPE_API_KEY=sk_test_your_stripe_test_key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
EMERGENT_LLM_KEY=your-emergent-llm-key
CORS_ORIGINS=https://your-app-name.vercel.app
REACT_APP_BACKEND_URL=https://your-app-name.vercel.app
```

### 5. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client
4. Add your Vercel domain to:
   - **Authorized JavaScript origins**: `https://your-app-name.vercel.app`
   - **Authorized redirect URIs**: `https://your-app-name.vercel.app/converter`

### 6. Update Stripe Settings

1. Log into [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Settings > Webhooks
3. Add endpoint: `https://your-app-name.vercel.app/api/webhook/stripe`
4. Select events: `checkout.session.completed`

### 7. Test Your Deployment

1. Visit your Vercel URL
2. Test anonymous PDF conversion
3. Test user registration/login
4. Test Stripe payment flow
5. Verify all pages load correctly

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check build logs in Vercel dashboard
2. **Environment Variables**: Ensure all required vars are set
3. **CORS Errors**: Verify CORS_ORIGINS includes your Vercel domain
4. **Database Connection**: Test MongoDB connection string
5. **API Routes**: Ensure `/api/*` routes are working

### Build Commands for Different Setups:

**If build fails, try these alternatives:**

```bash
# Option 1: Root build
npm install && cd frontend && npm install && npm run build

# Option 2: Yarn
yarn install && cd frontend && yarn install && yarn build

# Option 3: Specific Node version
NODE_VERSION=18 npm install && cd frontend && npm install && npm run build
```

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas configured
- [ ] All environment variables set in Vercel
- [ ] Google OAuth domains updated
- [ ] Stripe webhooks configured
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test payment flows end-to-end

## Support

For deployment issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Join community forums for additional help

Your Bank Statement Converter will be live at: `https://your-app-name.vercel.app`