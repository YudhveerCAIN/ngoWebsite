# Resend Email Service Setup Guide

## Why Resend?

Resend is a modern email API that's designed for developers and works perfectly with cloud platforms like Render. It's more reliable than SMTP for production applications.

## Step 1: Create Resend Account

1. **Go to [resend.com](https://resend.com)**
2. **Sign up for a free account**
   - Free tier: 3,000 emails/month
   - 100 emails/day limit
3. **Verify your email address**

## Step 2: Add Your Domain (Recommended)

1. **Go to Domains in Resend dashboard**
2. **Click "Add Domain"**
3. **Enter your domain** (e.g., `urjjapratishthan.org`)
4. **Add the DNS records** provided by Resend to your domain
5. **Verify the domain**

**Note:** If you don't have a domain, you can use the default `onboarding@resend.dev` for testing.

## Step 3: Get API Key

1. **Go to API Keys in Resend dashboard**
2. **Click "Create API Key"**
3. **Name it** (e.g., "Urjja Pratishthan Production")
4. **Select permissions:** "Sending access"
5. **Copy the API key** (starts with `re_`)

## Step 4: Update Environment Variables

### In Render Dashboard:

Add these environment variables to your Render service:

```
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=Urjja Pratishthan Prakashalay <noreply@urjjapratishthan.org>
EMAIL_SERVICE=resend
ADMIN_EMAIL_NOTIFICATIONS=urjjapratishthan@gmail.com
```

**Important:** Replace `re_your_actual_api_key_here` with your actual Resend API key.

### Email From Address:

- **With your domain:** `noreply@urjjapratishthan.org`
- **Without domain (testing):** `onboarding@resend.dev`

## Step 5: Test the Setup

### Test via API endpoint:
```bash
curl -X POST https://ngowebsite-grf0.onrender.com/api/debug/test-resend \
  -H "Content-Type: application/json" \
  -d '{"email":"yudhveerdewal12@gmail.com"}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Test email sent via Resend successfully",
  "messageId": "some-unique-id",
  "sentTo": "yudhveerdewal12@gmail.com",
  "timestamp": "2025-10-29T..."
}
```

## Step 6: Domain Setup (Optional but Recommended)

### If you have a domain:

1. **Add these DNS records:**
   ```
   Type: TXT
   Name: @
   Value: (provided by Resend)
   
   Type: CNAME
   Name: resend._domainkey
   Value: (provided by Resend)
   ```

2. **Update EMAIL_FROM to use your domain:**
   ```
   EMAIL_FROM=Urjja Pratishthan Prakashalay <noreply@urjjapratishthan.org>
   ```

### If you don't have a domain:

Use the default sending address:
```
EMAIL_FROM=Urjja Pratishthan Prakashalay <onboarding@resend.dev>
```

## Step 7: Production Deployment

1. **Update Render environment variables**
2. **Redeploy your service** (automatic after env var changes)
3. **Test contact form and volunteer registration**
4. **Check Resend dashboard for email logs**

## Troubleshooting

### Common Issues:

1. **"API key not found" error**
   - Check that `RESEND_API_KEY` is set in Render
   - Verify the API key starts with `re_`

2. **"Domain not verified" error**
   - Use `onboarding@resend.dev` for testing
   - Or complete domain verification in Resend dashboard

3. **Emails not received**
   - Check spam folder
   - Verify email address is correct
   - Check Resend dashboard logs

### Debug Endpoints:

- **Test Resend:** `POST /api/debug/test-resend`
- **Check config:** `GET /api/debug/email`

## Benefits of Resend vs Gmail SMTP:

✅ **No connection timeouts**
✅ **Better deliverability**
✅ **Real-time logs and analytics**
✅ **No complex SMTP configuration**
✅ **Built for cloud platforms**
✅ **Free tier with good limits**

## Next Steps:

1. Create Resend account
2. Get API key
3. Add to Render environment variables
4. Test with debug endpoint
5. Remove debug endpoints after testing

## Support:

- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Resend Support:** Available in their dashboard
- **Free tier limits:** 3,000 emails/month, 100/day