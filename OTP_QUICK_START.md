# OTP Authentication Quick Start Guide

## Testing the OTP Flow

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Navigate to Login
- Go to `http://localhost:3000/auth/login`
- You'll see the Gen Z-styled login page with Phone/Email tabs

### Step 3: Phone OTP Flow
1. **Send OTP**
   - Phone tab is selected by default
   - Enter 10-digit number: `9876543210`
   - Click "Send OTP"
   - Check **browser console** (F12) for code like: `[v0] OTP for 9876543210: 123456`

2. **Verify OTP**
   - Enter the 6-digit code from console
   - Click "Verify & Continue"
   - Success animation appears
   - Redirected to dashboard

### Step 4: Email OTP Flow
1. **Send OTP**
   - Click Email tab
   - Enter email: `test@example.com`
   - Click "Send OTP"
   - Check **browser console** for code like: `[v0] OTP for test@example.com: 654321`

2. **Verify OTP**
   - Enter the 6-digit code from console
   - Click "Verify & Continue"
   - Success animation appears
   - Redirected to dashboard

## Test Credentials

### Phone Testing
| Action | Input |
|--------|-------|
| Phone Number | `9876543210` (or any 10-digit) |
| OTP Code | Check console for exact code |
| OTP Pattern | 6 digits (e.g., `123456`) |

### Email Testing
| Action | Input |
|--------|-------|
| Email | `test@example.com` (or any valid email) |
| OTP Code | Check console for exact code |
| OTP Pattern | 6 digits (e.g., `654321`) |

## Features to Test

- ✅ Phone number placeholder (30% opacity)
- ✅ 10-digit character limit
- ✅ Email validation (40 char max)
- ✅ OTP resend countdown (30 seconds)
- ✅ 6-digit OTP input only
- ✅ Error states (invalid OTP)
- ✅ Success animation
- ✅ Back button functionality
- ✅ Tab switching
- ✅ Motivational quotes at bottom

## Key Files

| File | Purpose |
|------|---------|
| `components/auth/login-form-enhanced.tsx` | Main login form with OTP flow |
| `components/auth/otp-verification.tsx` | OTP input & verification UI |
| `lib/auth/otp-handler.ts` | OTP generation & verification logic |
| `app/auth/login/page.tsx` | Login page with Gen Z design |

## Console Logs to Watch

When testing OTP, you'll see:
```
[v0] OTP sent to phone - check console for code
[v0] OTP for 9876543210: 123456
[v0] OTP for test@example.com: 654321
[v0] OTP verification error: [error details]
```

## Production Setup (Optional)

### For Email OTP (Resend)
```bash
# Add to .env.local
RESEND_API_KEY=your_key_here
```

### For Phone OTP (Twilio)
```bash
# Add to .env.local
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Common Issues

| Issue | Solution |
|-------|----------|
| OTP not in console | Press F12 to open DevTools, try again |
| "Invalid OTP" error | Ensure you copied code exactly from console |
| Verification stuck | Check browser console for error logs |
| Can't resend OTP | Wait for 30-second cooldown timer |

## Build & Deployment

```bash
# Verify build
npm run build

# Type check
npm run type-check

# Deploy to Vercel
vercel deploy
```

## Quick Navigation

- Login Page: `/auth/login`
- Dashboard (after login): `/dashboard`
- Profile: `/profile`

---

**Ready to test!** 🚀
