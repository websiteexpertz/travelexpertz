# Email OTP Authentication Setup Guide

## Overview
The authentication system has been converted from SMS/Phone-based OTP to Email-based OTP using Gmail SMTP.

## What Changed

### Backend Changes
1. **Email Service** (`lib/services/email.ts`)
   - Created new email service using nodemailer
   - Configured Gmail SMTP (port 587)
   - Beautiful HTML email template for OTP
   - Replaced old SMS service

2. **API Routes Updated**
   - `app/api/auth/send-otp/route.ts` - Now sends OTP to email
   - `app/api/auth/verify-otp/route.ts` - Verifies email OTP
   - `app/api/auth/signup/route.ts` - Creates user with email
   - `app/api/user/login/route.ts` - Login with email & password

3. **Utilities Updated**
   - Added `isValidEmail()` function in `lib/utils/auth.ts`
   - Email validation with proper regex pattern

### Frontend Changes
1. **Register Page** (`app/auth/register/page.tsx`)
   - Step 1: Email input instead of mobile
   - Step 2: OTP verification via email
   - Step 3: Name and password setup

2. **Login Page** (`app/auth/login/page.tsx`)
   - Email + password login form
   - Clean modern UI with proper error handling

### Database Schema
Users collection now stores:
```javascript
{
  email: "user@example.com",           // Primary identifier (lowercase)
  password: "hashed_password",          // bcrypt hashed
  emailVerified: true,                  // OTP verification status
  isActive: true,
  role: "user",
  createdAt: Date,
  updatedAt: Date
}
```

OTP collection stores:
```javascript
{
  email: "user@example.com",            // Lowercase
  otp: "123456",                        // 6-digit code
  purpose: "signup",                    // signup|login|reset_password
  expiresAt: Date,                      // 10 minutes validity
  verified: false,
  attempts: 0,                          // Max 5 attempts
  createdAt: Date
}
```

## Gmail SMTP Setup Instructions

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "TravelExpertz" as the name
5. Click "Generate"
6. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=travelexpertz

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# SMTP (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character App Password from Step 2
```

**Important:**
- Use your actual Gmail address for `SMTP_USER`
- Use the generated App Password (not your Gmail password) for `SMTP_PASSWORD`
- Remove spaces from the App Password

## Testing the Email OTP Flow

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Registration Flow
1. Navigate to: http://localhost:3000/auth/register
2. Enter your email address
3. Click "Send OTP"
4. Check your email inbox for the OTP code
5. Enter the 6-digit OTP
6. Complete signup with name and password

### 3. Check Email Delivery
The OTP email includes:
- ✅ Professional TravelExpertz branding
- ✅ Large, easy-to-read OTP code
- ✅ 10-minute validity notice
- ✅ Security warnings
- ✅ Mobile-responsive design

### 4. Test Login Flow
1. Navigate to: http://localhost:3000/auth/login
2. Enter your email and password
3. Login successfully

## Email Template Preview

The OTP email includes:
```
🌍 TravelExpertz
Your Travel, Our Expertise

Email Verification

Hello,

Thank you for registering with TravelExpertz. Please use the following OTP to verify your email address:

┌─────────────────┐
│  Your OTP Code  │
│    123456       │
│ Valid for 10min │
└─────────────────┘

⚠️ Security Notice: Never share this OTP with anyone. TravelExpertz will never ask for your OTP via phone or email.

If you didn't request this OTP, please ignore this email or contact our support team.

Best regards,
TravelExpertz Team

© 2026 TravelExpertz. All rights reserved.
```

## Troubleshooting

### OTP Email Not Received
1. **Check Spam/Junk Folder** - Gmail might filter it initially
2. **Verify SMTP Credentials** - Make sure App Password is correct (no spaces)
3. **Check Console Logs** - Look for "Email sent successfully" message
4. **Firewall/Antivirus** - Ensure port 587 is not blocked
5. **Gmail Account Status** - Ensure 2-Step Verification is active

### Common Errors

#### "Invalid credentials" or "Username and Password not accepted"
- **Cause**: Wrong App Password or regular Gmail password used
- **Solution**: Generate a new App Password and use it (not your Gmail password)

#### "Connection timeout"
- **Cause**: Port 587 blocked by firewall
- **Solution**: Check firewall settings or try port 465 with `secure: true`

#### "Daily sending quota exceeded"
- **Cause**: Gmail has a daily email limit (500 emails/day for free accounts)
- **Solution**: Wait 24 hours or upgrade to Google Workspace

### Email in Spam
To improve deliverability:
1. **Use verified domain** - Set up SPF/DKIM records
2. **Consistent sender** - Use same email address
3. **Professional content** - Our template is already optimized
4. **Report as Not Spam** - Ask users to mark as "Not Spam"

## Security Features

### OTP Protection
- ✅ 10-minute expiration time
- ✅ Maximum 5 verification attempts
- ✅ One-time use only
- ✅ Rate limiting (1 OTP per minute per email)
- ✅ Case-insensitive email storage

### Password Security
- ✅ bcrypt hashing with 10 salt rounds
- ✅ Minimum 8 characters
- ✅ Must include: uppercase, lowercase, number
- ✅ Password confirmation match

### Session Management
- ✅ JWT access tokens (15 minutes)
- ✅ JWT refresh tokens (7 days)
- ✅ httpOnly cookies
- ✅ Device tracking

## Production Deployment

### For Production Use
1. **Use a dedicated email service**:
   - SendGrid (99%+ deliverability)
   - AWS SES (cost-effective)
   - Mailgun (developer-friendly)
   - Postmark (fast delivery)

2. **Gmail Limits**:
   - Free: 500 emails/day
   - Google Workspace: 2,000 emails/day
   - **Not recommended for production**

3. **Update email service** (`lib/services/email.ts`):
```typescript
// Example with SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

## API Documentation

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "signup"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "signup"
}
```

### Complete Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### Login
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

## Next Steps

1. ✅ **Configure Gmail SMTP** - Follow setup instructions above
2. ✅ **Test complete registration flow**
3. ✅ **Test login flow**
4. ✅ **Verify email delivery**
5. ⏳ **Consider production email service** for scaling
6. ⏳ **Set up custom domain** for better deliverability
7. ⏳ **Implement email templates** for other notifications

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Test SMTP connection separately
5. Review the troubleshooting section above

---

**Created**: January 5, 2026
**System**: Email OTP Authentication with Gmail SMTP
**Framework**: Next.js 16 + TypeScript + MongoDB
