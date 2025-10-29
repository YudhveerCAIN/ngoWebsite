# Deployment Guide

This guide will help you deploy the Urjja Pratishthan website with:
- **Frontend**: Vercel (https://urjjapratishthan.vercel.app/)
- **Backend**: Render (https://ngowebsite-grf0.onrender.com/)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Your code should be pushed to GitHub
4. **Production Keys**: Get production keys for Razorpay and other services

## Frontend Deployment (Vercel)

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the root directory (not the frontend folder)

### Step 2: Configure Build Settings
Vercel will automatically detect the `vercel.json` configuration, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### Step 3: Set Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
VITE_APP_NAME=Urjja Pratishthan Prakashalay
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://ngowebsite-grf0.onrender.com/api
VITE_API_TIMEOUT=15000
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
VITE_CURRENCY=INR
VITE_MIN_DONATION_AMOUNT=100
VITE_CONTACT_EMAIL=info@urjjapratishthan.org
VITE_CONTACT_PHONE=+91 98765 43210
VITE_CONTACT_ADDRESS=123 Community Center Road, Bhosari, Pune - 411026, Maharashtra, India
VITE_FACEBOOK_URL=https://facebook.com/urjjapratishthan
VITE_TWITTER_URL=https://twitter.com/urjjapratishthan
VITE_INSTAGRAM_URL=https://instagram.com/urjjapratishthan
VITE_LINKEDIN_URL=https://linkedin.com/company/urjjapratishthan
VITE_FEATURE_VOLUNTEER_REGISTRATION=true
VITE_FEATURE_DONATION_PROCESSING=true
VITE_FEATURE_CONTACT_FORM=true
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_ANIMATIONS=true
VITE_META_TITLE=Urjja Pratishthan Prakashalay - Enabling Vision Through Education
VITE_META_DESCRIPTION=Join us in empowering underserved communities through education, skill development, and inclusive programs that create sustainable positive change.
VITE_META_KEYWORDS=NGO, education, community development, volunteering, donations, social impact
VITE_DEV_TOOLS=false
VITE_DEBUG_MODE=false
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be available at `https://urjjapratishthan.vercel.app/`

## Backend Deployment (Render)

### Step 1: Create Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `urjja-pratishthan-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Set Environment Variables
In Render dashboard, go to Environment and add these variables:

**Required - Set these values:**
```
NODE_ENV=production
PORT=10000
APP_NAME=Urjja Pratishthan Prakashalay
MONGODB_URI=mongodb+srv://urjjapratishthan_db_user:M0DlRloH7gk8jTtm@urjjapratishthan.enftqsh.mongodb.net/?appName=urjjapratishthan
JWT_SECRET=your_super_secure_jwt_secret_for_production_min_32_chars
EMAIL_USER=urjjapratishthan@gmail.com
EMAIL_PASS=lsxxoqvkayjmotfp
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret
```

**Auto-configured:**
```
JWT_EXPIRES_IN=8h
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=Urjja Pratishthan Prakashalay <urjjapratishthan@gmail.com>
ADMIN_EMAIL_NOTIFICATIONS=urjjapratishthan@gmail.com
CURRENCY=INR
MIN_DONATION_AMOUNT=100
FRONTEND_URL=https://urjjapratishthan.vercel.app
ALLOWED_ORIGINS=https://urjjapratishthan.vercel.app
FEATURE_VOLUNTEER_REGISTRATION=true
FEATURE_DONATION_PROCESSING=true
FEATURE_CONTACT_FORM=true
FEATURE_ADMIN_PANEL=true
FEATURE_EMAIL_NOTIFICATIONS=true
ENABLE_CORS=true
ENABLE_MORGAN_LOGGING=false
ENABLE_SEED_DATA=false
```

### Step 3: Deploy
1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Your API will be available at `https://ngowebsite-grf0.onrender.com/`

## Important Security Notes

### 1. Generate Strong JWT Secret
Replace `your_super_secure_jwt_secret_for_production_min_32_chars` with a strong, random string:
```bash
# Generate a secure JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Get Production Razorpay Keys
- Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Go to Settings > API Keys
- Generate production keys
- Replace `your_production_razorpay_key_id` and `your_production_razorpay_key_secret`

### 3. Verify Email Configuration
- The current email configuration uses Gmail SMTP
- Ensure the app password `lsxxoqvkayjmotfp` is still valid
- Consider using a dedicated email service for production

## Post-Deployment Checklist

### Frontend (Vercel)
- [ ] Site loads at https://urjjapratishthan.vercel.app/
- [ ] All pages are accessible
- [ ] Contact form works
- [ ] Donation flow works (test mode)
- [ ] Social media links work

### Backend (Render)
- [ ] API responds at https://ngowebsite-grf0.onrender.com/api/health
- [ ] Database connection works
- [ ] Email notifications work
- [ ] CORS is properly configured
- [ ] All endpoints are accessible

### Integration
- [ ] Frontend can communicate with backend
- [ ] Forms submit successfully
- [ ] Payment processing works
- [ ] Email notifications are sent

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel/Render dashboard
   - Verify all environment variables are set
   - Ensure dependencies are properly installed

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your Vercel URL
   - Check `FRONTEND_URL` is set correctly

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check database user permissions
   - Ensure IP whitelist includes Render's IPs (or use 0.0.0.0/0)

4. **Email Not Working**
   - Verify Gmail app password is correct
   - Check email service configuration
   - Test with a simple email first

## Monitoring

### Vercel
- Monitor deployments in Vercel dashboard
- Check function logs for errors
- Set up analytics if needed

### Render
- Monitor service health in Render dashboard
- Check logs for errors
- Set up alerts for downtime

## Updates and Maintenance

1. **Code Updates**: Push to GitHub, both services will auto-deploy
2. **Environment Variables**: Update in respective dashboards
3. **Dependencies**: Update package.json and redeploy
4. **Database**: Monitor usage and performance in MongoDB Atlas

## Support

If you encounter issues:
1. Check the logs in Vercel/Render dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check database connectivity