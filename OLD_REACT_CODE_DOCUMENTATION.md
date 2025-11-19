# Old React (Production) Code - Complete Structure

## 📁 **Extracted Location**

The old React code (currently deployed on https://yourbankstatementconverter.com/) has been extracted to:

**Location:** `/app/frontend-react-old/`

---

## 📋 **Complete File Structure**

```
/app/frontend-react-old/
├── package.json                    # React dependencies
├── src/
│   ├── App.js                      # Main React Router setup
│   ├── App.css                     # Global styles
│   ├── index.js                    # React entry point
│   ├── index.css                   # Base CSS
│   │
│   ├── pages/
│   │   ├── Converter.jsx           # Main conversion page (20KB)
│   │   ├── Login.jsx               # Login page (8KB)
│   │   ├── Signup.jsx              # Signup page (13KB)
│   │   ├── Pricing.jsx             # Pricing page (8KB)
│   │   ├── Documents.jsx           # Documents library (10KB)
│   │   ├── Settings.jsx            # Settings page (13KB)
│   │   ├── Blog.jsx                # Blog redirect (0.9KB)
│   │   ├── PrivacyPolicy.jsx       # Privacy policy (11KB)
│   │   ├── TermsConditions.jsx     # Terms (31KB)
│   │   └── CookiePolicy.jsx        # Cookie policy (7KB)
│   │
│   ├── components/
│   │   ├── Header.jsx              # Navigation header
│   │   ├── Footer.jsx              # Site footer
│   │   ├── ProtectedRoute.jsx      # Auth guard
│   │   ├── FileUpload.jsx          # File upload component
│   │   ├── ProcessingState.jsx     # Loading state
│   │   ├── Results.jsx             # Conversion results
│   │   └── EnterpriseContactModal.jsx  # Enterprise modal
│   │
│   ├── contexts/
│   │   └── AuthContext.js          # Authentication context
│   │
│   └── utils/
│       └── fingerprint.js          # Browser fingerprinting
```

---

## 🔑 **Key Files Overview**

### 1. **App.js** (Main Router)

**Technology:** React Router v6
**Routes:**
- `/` → Converter
- `/login` → Login
- `/signup` → Signup
- `/pricing` → Pricing
- `/documents` → Documents (Protected)
- `/settings` → Settings (Protected)
- `/blog` → Blog (Redirect to backend)
- `/privacy-policy` → Privacy Policy
- `/terms-conditions` → Terms
- `/cookie-policy` → Cookie Policy

**Key Features:**
- `<AuthProvider>` wraps entire app
- Protected routes for authenticated pages
- Toast notifications (Sonner)
- Header/Footer on all pages

---

### 2. **Converter.jsx** (Main Page - 20KB)

**Largest file - Main functionality:**
```jsx
- File upload drag & drop
- Anonymous conversion (1 free)
- Authenticated conversion (7 daily free)
- Page limit checking
- PDF processing with Gemini AI
- Excel/CSV download
- Progress states
- Error handling
```

**API Endpoints Used:**
- `POST /api/process-pdf` - Authenticated conversion
- `POST /api/anonymous/convert` - Anonymous conversion
- `POST /api/anonymous/check` - Check limit
- `GET /api/documents/{id}/download` - Download file

---

### 3. **package.json**

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "axios": "^1.7.7",
    "@fingerprintjs/fingerprintjs": "^4.5.1",
    "lucide-react": "^0.446.0",
    "sonner": "^1.5.0",
    "date-fns": "^4.1.0",
    "recharts": "^2.12.7",
    "@radix-ui/*": "..." // Various UI components
  }
}
```

**Build Scripts:**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

### 4. **AuthContext.js**

**Functionality:**
- User authentication state
- Login/Signup/Logout
- Token management (localStorage)
- User data fetching
- Auto-refresh on mount

**Key Methods:**
```javascript
- login(email, password)
- signup(fullName, email, password, confirmPassword)
- logout()
- refreshUser()
```

---

### 5. **Converter.jsx - Key Code Sections**

**Anonymous Conversion Limit:**
```javascript
const checkAnonymousLimit = async () => {
  const fp = await getBrowserFingerprint();
  const response = await axios.post('/api/anonymous/check', {
    browser_fingerprint: fp
  });
  setAnonymousData(response.data);
};
```

**Conversion Handler:**
```javascript
const handleConvert = async () => {
  // Check pages remaining
  if (user?.pages_remaining <= 0) {
    navigate('/pricing');
    return;
  }
  
  // Upload and process
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post('/api/process-pdf', formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  setResult(response.data);
};
```

**Download Handler:**
```javascript
const handleDownload = async (format) => {
  const response = await axios.get(
    `/api/documents/${documentId}/download?format=${format}`,
    { responseType: 'blob' }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `statement.${format}`;
  link.click();
};
```

---

### 6. **Pricing.jsx**

**Plans Structure:**
```javascript
const plans = [
  {
    name: 'Starter',
    price: '$15',
    pages: 400,
    features: ['400 pages/month', 'Email support', ...]
  },
  {
    name: 'Professional',
    price: '$30',
    pages: 1000,
    popular: true,
    features: ['1000 pages/month', 'Priority support', ...]
  },
  {
    name: 'Business',
    price: '$50',
    pages: 4000,
    features: ['4000 pages/month', 'Team features', ...]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited pages', 'Dedicated support', ...]
  }
];
```

**Dodo Payments Integration:**
```javascript
const handleSubscribe = async (packageId) => {
  const response = await axios.post('/api/dodo/create-subscription', {
    package_id: packageId,
    billing_interval: billingInterval
  });
  
  window.location.href = response.data.checkout_url;
};
```

---

### 7. **Header.jsx**

**Navigation Structure:**
```jsx
<Header>
  <Logo />
  <Nav>
    {isAuthenticated ? (
      <>
        <Link to="/documents">Documents</Link>
        <Link to="/settings">Settings</Link>
        <Button onClick={logout}>Logout</Button>
      </>
    ) : (
      <>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
      </>
    )}
  </Nav>
</Header>
```

---

### 8. **Login.jsx**

**Google OAuth Integration:**
```javascript
const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};
```

**Form Login:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await axios.post('/api/auth/login', {
    email,
    password
  });
  
  localStorage.setItem('token', response.data.access_token);
  setUser(response.data.user);
  navigate('/');
};
```

---

## 🎨 **Styling Approach**

**Technology:** Tailwind CSS + Shadcn UI

**Key Classes Used:**
```css
- Cards: "bg-white rounded-xl shadow-sm p-6"
- Buttons: "btn-primary", "btn-secondary"
- Inputs: "input"
- Layout: "max-w-7xl mx-auto px-4"
```

---

## 📊 **Conversion Flow**

### Anonymous User:
```
1. Visit / → See "1 free conversion"
2. Upload PDF
3. Convert → POST /api/anonymous/convert
4. Download → Create blob from response
5. See "Sign up for 7 more!"
```

### Authenticated User:
```
1. Login → Get token
2. Visit / → See "X pages remaining"
3. Upload PDF
4. Convert → POST /api/process-pdf
5. Download → GET /api/documents/{id}/download
6. Pages decrease automatically
7. At 0 pages → Redirect to /pricing
```

---

## 🔧 **API Integration**

### Base URL:
```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL;
// Production: https://yourbankstatementconverter.com
```

### Key Endpoints:
```
POST /api/auth/login
POST /api/auth/signup
GET  /api/auth/oauth/session-data
POST /api/process-pdf
POST /api/anonymous/convert
POST /api/anonymous/check
GET  /api/documents
GET  /api/documents/{id}/download
POST /api/dodo/create-subscription
GET  /api/blog/*
```

---

## 🚀 **Build & Deploy**

### Development:
```bash
cd /app/frontend-react-old
npm install
npm start
# Runs on http://localhost:3000
```

### Production Build:
```bash
npm run build
# Output: /build/ directory with static files
# Files: index.html, static/js/main.*.js, static/css/main.*.css
```

### Deployed Files:
```
/static/js/main.d07f194b.js    (Main JavaScript bundle)
/static/css/main.db937557.css  (Main CSS bundle)
```

---

## ✅ **Key Features in Production Code**

1. ✅ **Conversion Limits**
   - 1 free for anonymous (browser fingerprint tracked)
   - 7 free daily for authenticated users
   - Resets every 24 hours

2. ✅ **Authentication**
   - Email/password login
   - Google OAuth
   - JWT token storage
   - Protected routes

3. ✅ **Payments**
   - Dodo Payments integration
   - 4 pricing tiers
   - Monthly/Annual billing
   - Checkout redirect

4. ✅ **File Processing**
   - PDF upload (max 10MB)
   - Gemini AI extraction
   - Excel/CSV download
   - Page count tracking

5. ✅ **User Management**
   - Documents library
   - Settings page
   - Profile updates
   - Password change

6. ✅ **Blog Integration**
   - WordPress proxy
   - External blog at /blog
   - Backend handles routing

---

## 📄 **Complete Code Available At:**

**Location:** `/app/frontend-react-old/`

**View All Files:**
```bash
cd /app/frontend-react-old
find . -type f -name "*.js*" | head -30
```

**Key Files to Check:**
```bash
cat /app/frontend-react-old/src/App.js
cat /app/frontend-react-old/src/pages/Converter.jsx
cat /app/frontend-react-old/src/pages/Pricing.jsx
cat /app/frontend-react-old/package.json
```

---

## ✅ **This is YOUR PRODUCTION CODE**

This is the exact React code currently deployed and running on:
**https://yourbankstatementconverter.com/**

All 17 users are using this version right now! 🎉
