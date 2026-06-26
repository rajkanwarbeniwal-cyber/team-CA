# Email OTP Setup Guide - Taksha Platform

## Current Status

✅ **OTP Email Integration is READY**

The system now includes:
- Resend email service integration (already installed)
- Automatic OTP email sending on new account creation
- Confirmation email after successful signup
- Fallback to console logs for development (no RESEND_API_KEY needed)

## How It Works

### Development Mode (Testing without API key)
1. User enters email and clicks "Send OTP"
2. OTP is generated and logged to **browser console** (F12)
3. Enter the 6-digit code from console
4. On first login (new user), confirmation email details are logged
5. User is logged in successfully

### Production Mode (with RESEND_API_KEY)
1. User enters email and clicks "Send OTP"
2. OTP email is sent via Resend to user's inbox
3. User enters code from email
4. On first login, welcome/confirmation email is sent automatically
5. User is logged in and can access dashboard

## Setup Instructions

### Step 1: Get Resend API Key (Optional for Development)

1. Go to [Resend.com](https://resend.com)
2. Sign up for free account
3. Go to API Keys section
4. Copy your API key

### Step 2: Add Environment Variable

Add to `.env.local`:
```bash
RESEND_API_KEY=re_your_api_key_here
```

Or add through Vercel dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add `RESEND_API_KEY` = your_key
4. Deploy

### Step 3: Verify Email Domain (Optional)

For production, you may need to verify the sending email domain:
1. In Resend dashboard, add your domain
2. Add DNS records as instructed
3. Verify domain

For development/testing, Resend provides a default domain (`noreply@taksha.app`).

## File Structure

```
lib/auth/
├── otp-handler.ts              # OTP generation & verification
├── otp-server-actions.ts       # Server actions for email
└── send-email.ts               # Resend integration (already exists)

components/auth/
├── login-form-enhanced.tsx     # Main login form with email flow
└── otp-verification.tsx        # OTP input component
```

## Testing Flows

### Test 1: Development Mode (No API Key)
```
1. Go to /auth/login
2. Click Email tab
3. Enter: test@example.com
4. Click "Send OTP"
5. Open DevTools (F12) → Console
6. Look for: [v0] OTP for test@example.com: XXXXXX
7. Enter that 6-digit code
8. Click "Verify & Continue"
9. New user confirmation logged to console
10. Successfully logged in! ✓
```

### Test 2: Production Mode (With API Key)
```
1. Set RESEND_API_KEY in .env.local
2. Go to /auth/login
3. Click Email tab
4. Enter your real email
5. Click "Send OTP"
6. Check your email inbox for OTP code
7. Enter the code
8. Click "Verify & Continue"
9. Check email for welcome/confirmation message
10. Successfully logged in! ✓
```

## Email Templates

### OTP Verification Email
- Subject: "Your Taksha Verification Code: XXXXXX"
- Contains 6-digit OTP code
- 10-minute validity
- Beautiful gradient design

### Welcome/Confirmation Email
- Subject: "Welcome to Taksha, {username}!"
- Sent on first successful login
- Contains onboarding steps
- Link to complete profile
- Professional design

## Console Logs to Watch

Development mode console messages:
```
[v0] OTP sent to email - check console for code
[v0] OTP email sent successfully to test@example.com
[v0] OTP for test@example.com: 123456
[v0] Confirmation email sent to: test@example.com
```

Error messages:
```
[v0] RESEND_API_KEY not set, OTP will be logged to console
[v0] Failed to send email via Resend: [error details]
```

## Production Checklist

- [ ] Add RESEND_API_KEY to environment variables
- [ ] Test email sending with real email
- [ ] Verify Resend domain (if needed)
- [ ] Update email branding/sender name if desired
- [ ] Test both OTP and confirmation emails
- [ ] Update app URLs in send-email.ts template if needed
- [ ] Deploy to production
- [ ] Test full flow on production domain

## Troubleshooting

### OTP Not Arriving in Email
**Solution:**
- Check RESEND_API_KEY is correct
- Check email spam folder
- Check Resend dashboard for failed sends
- Verify recipient email is correct

### "RESEND_API_KEY not set" Warning
**This is normal in development!** The system falls back to console logging. To enable real emails, add your API key.

### Emails Going to Spam
**Solutions:**
- Use verified domain in Resend
- Add SPF/DKIM records
- Check email content (Resend templates are already optimized)

### Build Errors
Run these commands:
```bash
npm run build           # Full build test
npm run type-check    # TypeScript validation
npm run dev           # Local dev server
```

## Support Files

- `OTP_AUTH_IMPLEMENTATION.md` - Full technical reference
- `OTP_QUICK_START.md` - Quick testing guide
- `GEN_Z_LOGIN_IMPLEMENTATION.md` - UI/design documentation

## What's Next?

After emails work:
1. Test profile completion flow
2. Test subject strength mapper
3. Add real Twilio integration for phone OTP (optional)
4. Set up email preferences/unsubscribe
5. Add rate limiting for OTP requests

---

**Email integration is complete and ready to deploy!** 🚀
