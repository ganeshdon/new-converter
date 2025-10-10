# WordPress Blog Integration with Emergent Deployment

## Current Setup Analysis
- **Main App**: Deployed on Emergent platform
- **WordPress Blog**: Hosted on Hostinger 
- **Domain**: yourbankstatementconverter.com
- **Blog Path**: /blog should route to WordPress

## Issue Identified
The `/blog` path is currently being handled by your Emergent deployment instead of routing to your Hostinger WordPress installation.

## Solution Options

### Option 1: DNS Subdomain Routing (Recommended)
Set up `blog.yourbankstatementconverter.com` to point directly to your Hostinger WordPress.

**Steps:**
1. In your domain registrar (where you bought yourbankstatementconverter.com):
   - Add CNAME record: `blog` → `your-hostinger-site.com`
   - Or A record: `blog` → [Hostinger IP address]

2. In Hostinger WordPress settings:
   - Update Site URL to: `https://blog.yourbankstatementconverter.com`
   - Update WordPress URL to: `https://blog.yourbankstatementconverter.com`

**Result:**
- Main app: `yourbankstatementconverter.com`
- Blog: `blog.yourbankstatementconverter.com`
- Admin: `blog.yourbankstatementconverter.com/wp-admin`

### Option 2: Proxy Configuration in Emergent
Configure your Emergent deployment to proxy `/blog` requests to Hostinger.

**Steps:**
1. Update your backend server to handle `/blog` routing
2. Add proxy middleware to forward blog requests
3. Configure CORS and headers properly

### Option 3: Hostinger Subdirectory Setup
Configure your domain's root to point to Emergent, with `/blog` subdirectory pointing to WordPress.

**Steps:**
1. In your domain registrar:
   - Main domain: Point to Emergent
   - Subdirectory routing: Configure `/blog` path

2. In Hostinger:
   - Configure WordPress for subdirectory installation
   - Update .htaccess for proper routing

## Recommended Implementation: Option 1 (Subdomain)

This is the cleanest approach that won't interfere with your Emergent deployment.

### DNS Configuration Steps:

1. **Login to your domain registrar** (where you bought yourbankstatementconverter.com)

2. **Find DNS Management** section

3. **Add CNAME record:**
   ```
   Type: CNAME
   Name: blog
   Value: [your-hostinger-domain].com
   TTL: 3600
   ```

4. **Update WordPress URLs in Hostinger:**
   - Login to WordPress admin
   - Go to Settings → General
   - WordPress Address (URL): `https://blog.yourbankstatementconverter.com`
   - Site Address (URL): `https://blog.yourbankstatementconverter.com`

5. **Test the setup:**
   - Main app: `yourbankstatementconverter.com`
   - Blog: `blog.yourbankstatementconverter.com`

### If You Prefer `/blog` Path (Advanced)

If you specifically want `yourbankstatementconverter.com/blog`, you'll need to:

1. **Configure reverse proxy in your backend**
2. **Update Emergent routing configuration** 
3. **Handle CORS and SSL certificates properly**

This requires backend modifications and is more complex.

## Quick Test Commands

```bash
# Test main app
curl -I https://yourbankstatementconverter.com

# Test blog (current - should show WordPress)
curl -I https://yourbankstatementconverter.com/blog

# Test blog (after subdomain setup)
curl -I https://blog.yourbankstatementconverter.com
```

## Next Steps

**Choose your preferred approach:**

1. **Subdomain (Easiest)**: `blog.yourbankstatementconverter.com`
   - Quick DNS change
   - No code modifications needed
   - Clean separation

2. **Subdirectory (Complex)**: `yourbankstatementconverter.com/blog`  
   - Requires backend proxy setup
   - More complex configuration
   - Potential CORS issues

**Recommendation**: Go with subdomain approach for simplicity and reliability.

Would you like me to help you with the DNS configuration or do you prefer to implement the subdirectory routing?