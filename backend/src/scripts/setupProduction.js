#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * 
 * This script helps set up production environment configuration
 * by generating secure values and providing deployment guidance.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🏭 Production Environment Setup\n');

// Generate secure random values
function generateSecureSecret(length = 64) {
	return crypto.randomBytes(length).toString('hex');
}

function generateApiKey(length = 32) {
	return crypto.randomBytes(length).toString('base64url');
}

// Production environment template
const productionEnvTemplate = `# =============================================================================
# URJJA PRATISHTHAN PRAKASHALAY - PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================
# Generated on: ${new Date().toISOString()}
# IMPORTANT: Update all placeholder values with actual production credentials
# NEVER commit this file to version control

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
NODE_ENV=production
PORT=5000
APP_NAME="Urjja Pratishthan Prakashalay"
APP_VERSION=1.0.0

# =============================================================================
# DATABASE CONFIGURATION - MONGODB ATLAS
# =============================================================================
# Replace with your MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://REPLACE_USERNAME:REPLACE_PASSWORD@REPLACE_CLUSTER.mongodb.net/urjja-pratishthan-prod?retryWrites=true&w=majority

# Database Options
DB_MAX_POOL_SIZE=20
DB_SERVER_SELECTION_TIMEOUT=5000
DB_SOCKET_TIMEOUT=45000

# =============================================================================
# AUTHENTICATION & SECURITY
# =============================================================================
# Strong JWT secret (generated)
JWT_SECRET=${generateSecureSecret(64)}
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials - CHANGE THESE VALUES
ADMIN_EMAIL=admin@urjjapratishthan.org
ADMIN_NAME="Admin User"
ADMIN_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD

# API Key for admin operations (generated)
ADMIN_API_KEY=${generateApiKey(32)}

# =============================================================================
# EMAIL CONFIGURATION - PRODUCTION SMTP
# =============================================================================
# Email Service Provider
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Email Credentials - UPDATE THESE
EMAIL_USER=noreply@urjjapratishthan.org
EMAIL_PASS=REPLACE_WITH_APP_PASSWORD

# Email Addresses
EMAIL_FROM="Urjja Pratishthan Prakashalay <noreply@urjjapratishthan.org>"
ADMIN_EMAIL_NOTIFICATIONS=admin@urjjapratishthan.org
CONTACT_EMAIL=info@urjjapratishthan.org

# =============================================================================
# PAYMENT GATEWAY - RAZORPAY LIVE CREDENTIALS
# =============================================================================
# Razorpay Live Credentials - UPDATE THESE
RAZORPAY_KEY_ID=rzp_live_REPLACE_WITH_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=REPLACE_WITH_LIVE_SECRET_KEY
RAZORPAY_WEBHOOK_SECRET=REPLACE_WITH_WEBHOOK_SECRET

# Payment Settings
CURRENCY=INR
MIN_DONATION_AMOUNT=100
MAX_DONATION_AMOUNT=1000000

# =============================================================================
# EXTERNAL SERVICES
# =============================================================================
# Cloudinary for image management
CLOUDINARY_CLOUD_NAME=REPLACE_WITH_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=REPLACE_WITH_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=REPLACE_WITH_CLOUDINARY_API_SECRET

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=REPLACE_WITH_TWILIO_SID
TWILIO_AUTH_TOKEN=REPLACE_WITH_TWILIO_TOKEN
TWILIO_PHONE_NUMBER=+1234567890

# =============================================================================
# CORS & SECURITY SETTINGS
# =============================================================================
# Production Frontend URLs
FRONTEND_URL=https://urjjapratishthan.org
ALLOWED_ORIGINS=https://urjjapratishthan.org,https://www.urjjapratishthan.org

# Security Headers
HELMET_ENABLED=true
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# LOGGING & MONITORING
# =============================================================================
# Log Level (error, warn, info)
LOG_LEVEL=warn
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/app.log

# Error Tracking
SENTRY_DSN=REPLACE_WITH_SENTRY_DSN
NEW_RELIC_LICENSE_KEY=REPLACE_WITH_NEW_RELIC_KEY

# =============================================================================
# CACHE CONFIGURATION
# =============================================================================
# Redis Configuration (Optional but recommended)
REDIS_URL=redis://REPLACE_WITH_REDIS_URL:6379
REDIS_PASSWORD=REPLACE_WITH_REDIS_PASSWORD
CACHE_TTL=3600

# =============================================================================
# PRODUCTION SETTINGS
# =============================================================================
# Production-specific settings
SESSION_SECURE=true
COOKIE_SECURE=true
FORCE_HTTPS=true

# Performance Settings
MAX_REQUEST_SIZE=10mb
COMPRESSION_ENABLED=true
STATIC_FILE_CACHE_MAX_AGE=86400

# =============================================================================
# BACKUP & MAINTENANCE
# =============================================================================
# Database Backup Settings
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_PATH=./backups

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="We are currently performing maintenance. Please try again later."

# =============================================================================
# FEATURE FLAGS
# =============================================================================
# Enable/Disable specific features
FEATURE_VOLUNTEER_REGISTRATION=true
FEATURE_DONATION_PROCESSING=true
FEATURE_EVENT_MANAGEMENT=true
FEATURE_CONTACT_FORM=true
FEATURE_ADMIN_PANEL=true
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_SMS_NOTIFICATIONS=false
FEATURE_ANALYTICS=true

# =============================================================================
# ANALYTICS & TRACKING
# =============================================================================
# Google Analytics
GA_TRACKING_ID=REPLACE_WITH_GA_TRACKING_ID

# Facebook Pixel
FB_PIXEL_ID=REPLACE_WITH_FB_PIXEL_ID

# Other Analytics
MIXPANEL_TOKEN=REPLACE_WITH_MIXPANEL_TOKEN
HOTJAR_ID=REPLACE_WITH_HOTJAR_ID
`;

// Write production environment file
const productionEnvPath = '.env.production';
fs.writeFileSync(productionEnvPath, productionEnvTemplate);

console.log(`✅ Generated production environment template: ${productionEnvPath}`);

// Production deployment checklist
const deploymentChecklist = `# 🚀 Production Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas cluster
- [ ] Configure database user with appropriate permissions
- [ ] Whitelist production server IP addresses
- [ ] Update MONGODB_URI in .env.production

### 2. Email Configuration
- [ ] Set up production email service (Gmail App Password or SMTP service)
- [ ] Update EMAIL_USER and EMAIL_PASS in .env.production
- [ ] Test email delivery in staging environment

### 3. Payment Gateway (Razorpay)
- [ ] Activate Razorpay live account
- [ ] Generate live API keys
- [ ] Configure webhook endpoints
- [ ] Update RAZORPAY_* variables in .env.production
- [ ] Test payment flow in staging

### 4. External Services
- [ ] Set up Cloudinary account for image management
- [ ] Configure Sentry for error tracking
- [ ] Set up monitoring services (New Relic, etc.)
- [ ] Update service credentials in .env.production

### 5. Security Configuration
- [ ] Generate strong JWT_SECRET (already generated)
- [ ] Change default ADMIN_PASSWORD
- [ ] Configure HTTPS certificates
- [ ] Set up firewall rules
- [ ] Enable security headers

### 6. Domain & SSL
- [ ] Configure domain DNS settings
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Update FRONTEND_URL and ALLOWED_ORIGINS
- [ ] Test HTTPS redirect

## Deployment Steps

### 1. Server Setup
\`\`\`bash
# Install Node.js 18+ and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Clone repository
git clone <repository-url>
cd urjja-pratishthan-prakashalay
\`\`\`

### 2. Backend Deployment
\`\`\`bash
cd backend
npm install --production
cp .env.production .env

# Validate environment
npm run validate-env

# Start with PM2
pm2 start src/server.js --name "urjja-backend"
pm2 save
pm2 startup
\`\`\`

### 3. Frontend Deployment
\`\`\`bash
cd frontend
npm install
cp .env.production .env

# Build for production
npm run build

# Serve with nginx or deploy to Vercel/Netlify
\`\`\`

### 4. Database Setup
\`\`\`bash
# Run database migrations (if any)
npm run migrate

# Seed initial data
npm run seed
\`\`\`

## Post-Deployment Verification

### 1. Health Checks
- [ ] Backend API health endpoint responds
- [ ] Database connection successful
- [ ] Frontend loads correctly
- [ ] All pages render without errors

### 2. Functionality Tests
- [ ] Volunteer registration works
- [ ] Donation processing works
- [ ] Email notifications sent
- [ ] Contact form submissions work
- [ ] Admin panel accessible

### 3. Performance & Security
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Page load times acceptable
- [ ] Mobile responsiveness verified

### 4. Monitoring Setup
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring active
- [ ] Log aggregation configured
- [ ] Backup schedule verified

## Environment Variables to Update

**Critical - Must be changed:**
- MONGODB_URI
- ADMIN_PASSWORD
- EMAIL_USER & EMAIL_PASS
- RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
- FRONTEND_URL & ALLOWED_ORIGINS

**Optional but recommended:**
- CLOUDINARY_* (for image management)
- SENTRY_DSN (for error tracking)
- REDIS_URL (for caching)
- Analytics tracking IDs

## Security Best Practices

1. **Never commit .env files to version control**
2. **Use strong, unique passwords**
3. **Enable HTTPS everywhere**
4. **Regularly update dependencies**
5. **Monitor for security vulnerabilities**
6. **Set up automated backups**
7. **Use environment-specific configurations**

## Troubleshooting

### Common Issues:
1. **Database connection fails**: Check MongoDB Atlas IP whitelist
2. **Email not sending**: Verify SMTP credentials and app passwords
3. **Payment failures**: Ensure Razorpay webhook URLs are correct
4. **CORS errors**: Verify ALLOWED_ORIGINS includes frontend domain

### Useful Commands:
\`\`\`bash
# Check application logs
pm2 logs urjja-backend

# Restart application
pm2 restart urjja-backend

# Monitor application
pm2 monit

# Validate environment
npm run validate-env
\`\`\`
`;

// Write deployment checklist
fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', deploymentChecklist);

console.log(`✅ Generated deployment checklist: DEPLOYMENT_CHECKLIST.md`);

console.log('\n🔐 Generated Security Values:');
console.log(`JWT_SECRET: ${generateSecureSecret(64).substring(0, 20)}... (64 chars)`);
console.log(`ADMIN_API_KEY: ${generateApiKey(32).substring(0, 20)}... (32 chars)`);

console.log('\n⚠️  Important Next Steps:');
console.log('1. Review and update .env.production with actual credentials');
console.log('2. Change the default ADMIN_PASSWORD');
console.log('3. Follow the deployment checklist');
console.log('4. Never commit .env.production to version control');

console.log('\n✅ Production environment setup complete!');