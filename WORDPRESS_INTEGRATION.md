# WordPress Blog Integration Guide

## Overview
This guide will help you set up WordPress at `yourbankstatementconverter.com/blog` while keeping your main Bank Statement Converter app on the root domain.

## Quick Setup (Recommended - Hostinger)

### 1. Purchase WordPress Hosting
- Go to [Hostinger WordPress Hosting](https://www.hostinger.com/wordpress-hosting)
- Choose "WordPress Starter" ($2.99/month)
- **Don't buy a domain** (you already have one)

### 2. Install WordPress
1. In Hostinger panel → "Auto Installer"
2. Select "WordPress"
3. **Important**: Set installation directory to `/blog`
4. Create admin username/password
5. Click "Install"

### 3. Configure Domain in Hostinger
1. Go to "Domains" section
2. Click "Add Domain"
3. Enter: `yourbankstatementconverter.com`
4. Point to your WordPress installation
5. Enable SSL certificate

### 4. WordPress Configuration
1. Login to WordPress admin: `your-hostinger-domain.com/blog/wp-admin`
2. Go to Settings → General
3. Set **WordPress Address (URL)**: `https://yourbankstatementconverter.com/blog`
4. Set **Site Address (URL)**: `https://yourbankstatementconverter.com/blog`
5. Save changes

### 5. Update Vercel Configuration
1. In your `vercel.json`, replace `YOUR-WORDPRESS-DOMAIN.com` with your Hostinger domain
2. Deploy updated configuration to Vercel

## Alternative: WordPress.com Business Plan

### 1. Setup WordPress.com
1. Go to [WordPress.com](https://wordpress.com/pricing/)
2. Choose "Business Plan" ($300/year)
3. Create your site (skip domain purchase)

### 2. Domain Mapping
1. In WordPress.com admin → Settings → General
2. Set site URL to: `yourbankstatementconverter.com/blog`
3. Configure domain mapping in WordPress.com settings

### 3. Update Vercel
- Replace `YOUR-WORDPRESS-DOMAIN.com` in vercel.json with your WordPress.com subdomain

## DNS Configuration

### If using custom hosting (Hostinger/DigitalOcean):
Add these DNS records in your domain registrar:

```
Type: A
Name: blog
Value: [Your hosting server IP]

Type: CNAME  
Name: www.blog
Value: yourbankstatementconverter.com
```

### If using WordPress.com:
WordPress.com will provide specific DNS instructions in their dashboard.

## Vercel Configuration Update

After setting up WordPress hosting, update your `vercel.json`:

```json
"rewrites": [
  {
    "source": "/blog/:path*",
    "destination": "https://YOUR-ACTUAL-WORDPRESS-URL.com/blog/:path*"
  }
]
```

Replace `YOUR-ACTUAL-WORDPRESS-URL.com` with:
- Hostinger: `your-account.hostinger-site.com` 
- WordPress.com: `your-site.wordpress.com`
- DigitalOcean: Your droplet's domain
- WP Engine: Your WP Engine URL

## Testing Your Setup

1. **Main app**: `yourbankstatementconverter.com` → Should load your Bank Statement Converter
2. **Blog**: `yourbankstatementconverter.com/blog` → Should load WordPress
3. **WordPress Admin**: `yourbankstatementconverter.com/blog/admin` → Should redirect to `yourbankstatementconverter.com/blog/wp-admin`

## WordPress Admin Access

WordPress admin is typically at: `yourbankstatementconverter.com/blog/wp-admin`

To make `/blog/admin` work, add this to your WordPress `.htaccess`:

```apache
# Redirect /blog/admin to /blog/wp-admin
RewriteRule ^admin/?$ wp-admin/ [R=301,L]
```

## Troubleshooting

### Common Issues:

1. **404 on /blog**: Check vercel.json rewrite rules
2. **SSL errors**: Ensure WordPress URL uses https://
3. **Mixed content**: Update WordPress site URL to use https://
4. **Admin redirect**: Check WordPress .htaccess file

### Testing Commands:
```bash
# Test blog accessibility
curl -I https://yourbankstatementconverter.com/blog

# Test admin redirect  
curl -I https://yourbankstatementconverter.com/blog/admin
```

## Security Considerations

1. **WordPress Updates**: Keep WordPress, themes, and plugins updated
2. **Strong Passwords**: Use strong admin passwords
3. **Security Plugins**: Install Wordfence or similar
4. **Backups**: Set up automated backups
5. **SSL**: Ensure SSL certificate covers blog subdirectory

## Cost Breakdown

**Hostinger Option**: ~$36/year
- WordPress hosting: $2.99/month
- SSL included
- Easy management

**WordPress.com Option**: $300/year  
- Fully managed
- Automatic updates
- Premium support

**Recommended**: Start with Hostinger for cost-effectiveness, upgrade to WordPress.com if you need more features.

## Next Steps

1. Choose hosting option
2. Set up WordPress
3. Update vercel.json with actual WordPress URL
4. Deploy to Vercel
5. Test both main app and blog
6. Configure WordPress theme and content

Your blog will be live at `yourbankstatementconverter.com/blog` with admin access at `yourbankstatementconverter.com/blog/wp-admin`!