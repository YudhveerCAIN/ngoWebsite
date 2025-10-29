# Email Service Troubleshooting Guide

## Issue: Emails not being sent after deployment to Render

### Step 1: Check Environment Variables on Render

1. **Go to your Render dashboard**
2. **Navigate to your backend service**
3. **Go to Environment tab**
4. **Verify these variables are set:**

```
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=urjjapratishthan@gmail.com
EMAIL_PASS=lsxxoqvkayjmotfp
EMAIL_FROM=Urjja Pratishthan Prakashalay <urjjapratishthan@gmail.com>
ADMIN_EMAIL_NOTIFICATIONS=urjjapratishthan@gmail.com
FEATURE_EMAIL_NOTIFICATIONS=true
```

### Step 2: Test Email Configuration

1. **Check email config endpoint:**
   ```
   GET https://ngowebsite-grf0.onrender.com/api/debug/email
   ```
   This will show you which environment variables are set.

2. **Test email sending:**
   ```
   POST https://ngowebsite-grf0.onrender.com/api/debug/test-email
   Content-Type: application/json
   
   {
     "email": "your-test-email@gmail.com"
   }
   ```

### Step 3: Common Issues and Solutions

#### Issue 1: Gmail App Password Invalid
**Symptoms:** Authentication errors in logs
**Solution:** 
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate a new App Password for "Mail"
4. Update `EMAIL_PASS` in Render with the new app password

#### Issue 2: Environment Variables Not Set
**Symptoms:** Debug endpoint shows "❌ Missing" for EMAIL_USER or EMAIL_PASS
**Solution:**
1. Add missing variables in Render dashboard
2. Redeploy the service

#### Issue 3: Gmail Security Blocking
**Symptoms:** "Less secure app access" errors
**Solution:**
1. Use App Passwords instead of regular password
2. Ensure 2FA is enabled on Gmail account
3. Use the 16-character app password in EMAIL_PASS

#### Issue 4: SMTP Connection Issues
**Symptoms:** Connection timeout or refused
**Solution:**
1. Verify EMAIL_HOST=smtp.gmail.com
2. Verify EMAIL_PORT=587
3. Verify EMAIL_SECURE=false
4. Check Render's outbound connection policies

### Step 4: Alternative Email Services

If Gmail continues to have issues, consider these alternatives:

#### Option 1: SendGrid
```
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

#### Option 2: Mailgun
```
EMAIL_SERVICE=mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_mailgun_smtp_user
EMAIL_PASS=your_mailgun_smtp_password
```

### Step 5: Debugging Steps

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your service
   - Check the "Logs" tab for email-related errors

2. **Look for these log messages:**
   ```
   🔧 Creating email transporter...
   📊 Environment check: ...
   📧 Creating Gmail SMTP transporter...
   ✅ Email transporter created successfully
   📧 Preparing volunteer confirmation email for: ...
   📤 Sending volunteer confirmation email...
   ✅ Volunteer confirmation email sent successfully: ...
   ```

3. **Common Error Messages:**
   - `❌ Email credentials missing` - Environment variables not set
   - `Authentication failed` - Wrong email/password
   - `Connection timeout` - Network/firewall issues
   - `Invalid login` - Need to use app password

### Step 6: Quick Fix Commands

**Test email configuration:**
```bash
curl https://ngowebsite-grf0.onrender.com/api/debug/email
```

**Send test email:**
```bash
curl -X POST https://ngowebsite-grf0.onrender.com/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### Step 7: Production Checklist

- [ ] Environment variables set in Render dashboard
- [ ] Gmail 2FA enabled
- [ ] App password generated and used
- [ ] Test endpoints working
- [ ] Email logs showing success messages
- [ ] Remove debug endpoints after fixing

### Step 8: Remove Debug Endpoints

After fixing the issue, remove these debug endpoints from `backend/src/app.js`:
- `/api/debug/email`
- `/api/debug/test-email`

## Most Likely Solution

The most common issue is that **environment variables are not set in the Render dashboard**. Even though they're in your `.env` file locally, Render needs them to be explicitly set in the dashboard.

### Quick Steps:
1. Go to Render dashboard → Your service → Environment
2. Add all email-related environment variables
3. Click "Save Changes"
4. Wait for automatic redeploy
5. Test with the debug endpoints above

## Contact for Help

If emails still don't work after following this guide:
1. Check the debug endpoint output
2. Share the Render logs
3. Verify the test email endpoint response