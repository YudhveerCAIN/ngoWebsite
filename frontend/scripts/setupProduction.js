#!/usr/bin/env node

/**
 * Frontend Production Environment Setup Script
 * 
 * This script helps set up production environment configuration
 * for the frontend application.
 */

import fs from 'fs';

console.log('🏭 Frontend Production Environment Setup\n');

// Production environment template for frontend
const frontendProductionEnvTemplate = `# =============================================================================
# URJJA PRATISHTHAN PRAKASHALAY - FRONTEND PRODUCTION ENVIRONMENT
# =============================================================================
# Generated on: ${new Date().toISOString()}
# IMPORTANT: Update all placeholder values with actual production credentials
# NEVER commit this file to version control

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
VITE_APP_NAME="Urjja Pratishthan Prakashalay"
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION="Enabling Vision Through Education and Opportunity"

# =============================================================================
# API CONFIGURATION
# =============================================================================
# Production Backend API URL - UPDATE THIS
VITE_API_URL=https://api.urjjapratishthan.org/api
VITE_API_TIMEOUT=10000

# WebSocket URL (if using real-time features)
VITE_WS_URL=wss://api.urjjapratishthan.org

# =============================================================================
# PAYMENT GATEWAY
# =============================================================================
# Razorpay Live Public Key - UPDATE THIS
VITE_RAZORPAY_KEY_ID=rzp_live_REPLACE_WITH_LIVE_KEY_ID

# Payment Configuration
VITE_CURRENCY=INR
VITE_MIN_DONATION_AMOUNT=100
VITE_MAX_DONATION_AMOUNT=1000000

# =============================================================================
# EXTERNAL SERVICES
# =============================================================================
# Google Maps API - UPDATE THIS
VITE_GOOGLE_MAPS_API_KEY=REPLACE_WITH_GOOGLE_MAPS_API_KEY

# Cloudinary - UPDATE THESE
VITE_CLOUDINARY_CLOUD_NAME=REPLACE_WITH_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET=REPLACE_WITH_UPLOAD_PRESET

# =============================================================================
# ANALYTICS & TRACKING
# =============================================================================
# Google Analytics - UPDATE THIS
VITE_GA_TRACKING_ID=G-REPLACE_WITH_GA4_ID

# Facebook Pixel - UPDATE THIS
VITE_FB_PIXEL_ID=REPLACE_WITH_FB_PIXEL_ID

# Google Tag Manager - UPDATE THIS
VITE_GTM_ID=GTM-REPLACE_WITH_GTM_ID

# Hotjar Analytics - UPDATE THESE
VITE_HOTJAR_ID=REPLACE_WITH_HOTJAR_ID
VITE_HOTJAR_SV=6

# =============================================================================
# SOCIAL MEDIA & CONTACT
# =============================================================================
# Organization Contact Information - UPDATE THESE
VITE_CONTACT_EMAIL=info@urjjapratishthan.org
VITE_CONTACT_PHONE="+91 98765 43210"
VITE_CONTACT_ADDRESS="123 Community Center Road, Bhosari, Pune - 411026, Maharashtra, India"

# Social Media Links - UPDATE THESE
VITE_FACEBOOK_URL=https://facebook.com/urjjapratishthan
VITE_TWITTER_URL=https://twitter.com/urjjapratishthan
VITE_INSTAGRAM_URL=https://instagram.com/urjjapratishthan
VITE_LINKEDIN_URL=https://linkedin.com/company/urjjapratishthan
VITE_YOUTUBE_URL=https://youtube.com/urjjapratishthan

# =============================================================================
# FEATURE FLAGS
# =============================================================================
# Enable/Disable specific features in the frontend
VITE_FEATURE_VOLUNTEER_REGISTRATION=true
VITE_FEATURE_DONATION_PROCESSING=true
VITE_FEATURE_EVENT_REGISTRATION=true
VITE_FEATURE_CONTACT_FORM=true
VITE_FEATURE_NEWSLETTER_SIGNUP=true
VITE_FEATURE_SOCIAL_SHARING=true
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_MULTILINGUAL=false
VITE_FEATURE_PWA=true
VITE_FEATURE_OFFLINE_MODE=false
VITE_FEATURE_ANIMATIONS=true

# =============================================================================
# UI/UX SETTINGS
# =============================================================================
# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_DEFAULT_LANGUAGE=en

# Animation Settings
VITE_ENABLE_ANIMATIONS=true
VITE_ANIMATION_DURATION=300

# Performance Settings
VITE_ENABLE_SERVICE_WORKER=true
VITE_CACHE_STRATEGY=networkFirst
VITE_IMAGE_LAZY_LOADING=true

# =============================================================================
# SEO & META TAGS
# =============================================================================
# Default Meta Information
VITE_META_TITLE="Urjja Pratishthan Prakashalay - Enabling Vision Through Education"
VITE_META_DESCRIPTION="Join us in empowering underserved communities through education, skill development, and inclusive programs that create sustainable positive change."
VITE_META_KEYWORDS="NGO, education, community development, volunteering, donations, social impact, Pune, Maharashtra, India"
VITE_META_AUTHOR="Urjja Pratishthan Prakashalay"

# Open Graph / Social Media
VITE_OG_IMAGE=https://urjjapratishthan.org/images/og-image.jpg
VITE_OG_SITE_NAME="Urjja Pratishthan Prakashalay"
VITE_TWITTER_CARD=summary_large_image
VITE_TWITTER_SITE=@urjjapratishthan

# =============================================================================
# PRODUCTION SETTINGS
# =============================================================================
# Production-specific settings
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_MINIFY_CSS=true
VITE_MINIFY_JS=true
VITE_GENERATE_SOURCEMAP=false

# CDN Configuration (Optional)
# VITE_CDN_URL=https://cdn.urjjapratishthan.org
# VITE_STATIC_ASSETS_URL=https://assets.urjjapratishthan.org

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
# Content Security Policy
VITE_CSP_ENABLED=true
VITE_CSP_REPORT_URI=https://urjjapratishthan.org/csp-report

# HTTPS Settings
VITE_FORCE_HTTPS=true
VITE_HSTS_MAX_AGE=31536000

# =============================================================================
# MONITORING & ERROR REPORTING
# =============================================================================
# Sentry for Error Tracking - UPDATE THIS
VITE_SENTRY_DSN=https://REPLACE_WITH_SENTRY_DSN@sentry.io/PROJECT_ID
VITE_SENTRY_ENVIRONMENT=production

# Performance Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1

# =============================================================================
# ACCESSIBILITY SETTINGS
# =============================================================================
# Accessibility Features
VITE_ENABLE_HIGH_CONTRAST=true
VITE_ENABLE_SCREEN_READER_SUPPORT=true
VITE_ENABLE_KEYBOARD_NAVIGATION=true
VITE_FONT_SIZE_ADJUSTMENT=true

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================
# Language Settings
VITE_DEFAULT_LOCALE=en
VITE_SUPPORTED_LOCALES=en,hi,mr
VITE_FALLBACK_LOCALE=en

# =============================================================================
# CACHE & STORAGE
# =============================================================================
# Local Storage Settings
VITE_STORAGE_PREFIX=urjja_
VITE_CACHE_VERSION=1.0.0
VITE_CACHE_EXPIRY=86400000

# Service Worker Cache
VITE_SW_CACHE_NAME=urjja-cache-v1
VITE_SW_CACHE_STRATEGY=cacheFirst

# =============================================================================
# THIRD-PARTY INTEGRATIONS
# =============================================================================
# reCAPTCHA (for form protection) - UPDATE THIS
VITE_RECAPTCHA_SITE_KEY=REPLACE_WITH_RECAPTCHA_SITE_KEY

# Crisp Chat (for customer support) - UPDATE THIS
VITE_CRISP_WEBSITE_ID=REPLACE_WITH_CRISP_WEBSITE_ID

# Calendly (for appointment scheduling) - UPDATE THIS
VITE_CALENDLY_URL=https://calendly.com/urjjapratishthan

# =============================================================================
# BUILD CONFIGURATION
# =============================================================================
# Build Settings
VITE_BUILD_TARGET=es2015
VITE_BUILD_OUTDIR=dist
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true

# Asset Optimization
VITE_OPTIMIZE_IMAGES=true
VITE_IMAGE_FORMATS=webp,avif,jpg,png
VITE_COMPRESS_ASSETS=true
`;

// Write production environment file
const productionEnvPath = '.env.production';
fs.writeFileSync(productionEnvPath, frontendProductionEnvTemplate);

console.log(`✅ Generated frontend production environment template: ${productionEnvPath}`);

// Frontend deployment guide
const frontendDeploymentGuide = `# 🚀 Frontend Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update .env.production with actual values
- [ ] Set correct VITE_API_URL (backend API endpoint)
- [ ] Configure Razorpay live key (VITE_RAZORPAY_KEY_ID)
- [ ] Set up analytics tracking IDs
- [ ] Update social media URLs
- [ ] Configure error tracking (Sentry)

### 2. Build Optimization
- [ ] Test production build locally
- [ ] Verify all environment variables are loaded
- [ ] Check bundle size and optimize if needed
- [ ] Test all features in production build

### 3. SEO & Meta Tags
- [ ] Verify meta titles and descriptions
- [ ] Set up Open Graph images
- [ ] Configure structured data
- [ ] Test social media sharing

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI:**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Deploy:**
   \`\`\`bash
   # From frontend directory
   vercel --prod
   \`\`\`

3. **Configure Environment Variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add all VITE_* variables from .env.production
   - Set for Production environment

### Option 2: Netlify Deployment

1. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Netlify:**
   - Drag and drop \`dist\` folder to Netlify
   - Or connect GitHub repository for automatic deployments

3. **Configure Environment Variables:**
   - Go to Site Settings > Environment Variables
   - Add all VITE_* variables

### Option 3: Traditional Server Deployment

1. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Serve with Nginx:**
   \`\`\`nginx
   server {
       listen 80;
       server_name urjjapratishthan.org;
       
       location / {
           root /var/www/urjja-frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   \`\`\`

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Payment integration works
- [ ] Contact form sends emails
- [ ] Navigation works properly

### 2. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness verified
- [ ] Images load properly

### 3. SEO & Analytics
- [ ] Google Analytics tracking works
- [ ] Meta tags display correctly
- [ ] Social media sharing works
- [ ] Search console configured

### 4. Security & Compliance
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No console errors
- [ ] Privacy policy accessible

## Environment Variables Reference

### Required for Production:
- \`VITE_API_URL\` - Backend API endpoint
- \`VITE_APP_NAME\` - Application name
- \`VITE_CONTACT_EMAIL\` - Contact email
- \`VITE_META_TITLE\` - Default page title
- \`VITE_META_DESCRIPTION\` - Default meta description

### Payment Integration:
- \`VITE_RAZORPAY_KEY_ID\` - Razorpay live public key
- \`VITE_CURRENCY\` - Payment currency (INR)

### Analytics (Optional but Recommended):
- \`VITE_GA_TRACKING_ID\` - Google Analytics 4 ID
- \`VITE_FB_PIXEL_ID\` - Facebook Pixel ID
- \`VITE_GTM_ID\` - Google Tag Manager ID

### Error Tracking:
- \`VITE_SENTRY_DSN\` - Sentry error tracking DSN

## Troubleshooting

### Common Issues:

1. **Environment variables not loading:**
   - Ensure variables start with \`VITE_\`
   - Check deployment platform environment settings
   - Verify .env.production is not committed to git

2. **API calls failing:**
   - Check CORS settings on backend
   - Verify VITE_API_URL is correct
   - Ensure backend is accessible from frontend domain

3. **Payment integration not working:**
   - Verify Razorpay key is live key (starts with rzp_live_)
   - Check webhook configurations
   - Test with small amounts first

4. **Build failures:**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check for circular dependencies

### Useful Commands:

\`\`\`bash
# Test production build locally
npm run build && npm run preview

# Validate environment variables
node scripts/validateEnv.js

# Analyze bundle size
npm run build -- --analyze

# Check for security vulnerabilities
npm audit
\`\`\`

## Performance Optimization Tips

1. **Image Optimization:**
   - Use WebP format when possible
   - Implement lazy loading
   - Optimize image sizes for different screen sizes

2. **Code Splitting:**
   - Already configured in vite.config.js
   - Consider route-based splitting for large apps

3. **Caching Strategy:**
   - Configure proper cache headers
   - Use service worker for offline functionality
   - Implement CDN for static assets

4. **Bundle Optimization:**
   - Remove unused dependencies
   - Use tree shaking
   - Minimize third-party libraries

## Security Best Practices

1. **Environment Variables:**
   - Never expose sensitive data in frontend
   - Use VITE_ prefix for public variables only
   - Validate all user inputs

2. **Content Security Policy:**
   - Configure CSP headers
   - Restrict external script sources
   - Monitor CSP violations

3. **HTTPS:**
   - Always use HTTPS in production
   - Configure HSTS headers
   - Use secure cookies

## Monitoring & Maintenance

1. **Error Tracking:**
   - Set up Sentry for error monitoring
   - Monitor console errors
   - Track user feedback

2. **Performance Monitoring:**
   - Use Google PageSpeed Insights
   - Monitor Core Web Vitals
   - Set up performance budgets

3. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging first
`;

// Write deployment guide
fs.writeFileSync('FRONTEND_DEPLOYMENT_GUIDE.md', frontendDeploymentGuide);

console.log(`✅ Generated frontend deployment guide: FRONTEND_DEPLOYMENT_GUIDE.md`);

console.log('\n⚠️  Important Next Steps:');
console.log('1. Review and update .env.production with actual credentials');
console.log('2. Test the production build locally with: npm run build && npm run preview');
console.log('3. Follow the deployment guide for your chosen platform');
console.log('4. Validate environment variables with: node scripts/validateEnv.js');

console.log('\n✅ Frontend production environment setup complete!');