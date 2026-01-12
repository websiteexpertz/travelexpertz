# 🚀 Quick Start - Email OTP Authentication

## Gmail SMTP Configuration

### 1. Get Gmail App Password
```
1. Visit: https://myaccount.google.com/apppasswords
2. Select: Mail → Other (Custom name) → "TravelExpertz"
3. Copy the 16-character password
```

### 2. Update .env File
```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

## Test the System

### 1. Start Server
```bash
npm run dev
```

### 2. Register New User
```
1. Go to: http://localhost:3000/auth/register
2. Enter email
3. Check inbox for OTP
4. Enter OTP code
5. Set name & password
```

### 3. Login
```
1. Go to: http://localhost:3000/auth/login
2. Enter email & password
3. Access granted!
```

## API Endpoints

### Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"signup"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","purpose":"signup"}'
```

### Complete Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

## File Changes Summary

### ✅ New Files
- `lib/services/email.ts` - Email service with nodemailer
- `.env.example` - Environment variable template
- `EMAIL_OTP_SETUP_GUIDE.md` - Complete setup documentation

### ✅ Modified Files
- `lib/utils/auth.ts` - Added isValidEmail() function
- `lib/jwt.ts` - Changed JWTPayload from mobile to email
- `app/api/auth/send-otp/route.ts` - Email-based OTP sending
- `app/api/auth/verify-otp/route.ts` - Email OTP verification
- `app/api/auth/signup/route.ts` - Email-based signup
- `app/api/user/login/route.ts` - Email-based login
- `app/auth/register/page.tsx` - Email input UI
- `app/auth/login/page.tsx` - Email login UI

## Database Collections

### users
```javascript
{
  email: "user@example.com",      // Primary key (lowercase)
  password: "hashed",             // bcrypt
  emailVerified: true,
  isActive: true,
  role: "user"
}
```

### otp_verifications
```javascript
{
  email: "user@example.com",
  otp: "123456",
  purpose: "signup",
  expiresAt: Date,               // 10 minutes
  verified: false,
  attempts: 0                     // Max 5
}
```

## Troubleshooting

### Email not received?
```
✓ Check spam folder
✓ Verify SMTP_USER and SMTP_PASSWORD in .env
✓ Ensure 2-Step Verification is enabled on Gmail
✓ Check console logs for "Email sent successfully"
```

### "Invalid credentials" error?
```
✓ Use App Password (not Gmail password)
✓ Remove spaces from App Password
✓ Regenerate App Password if needed
```

### Connection timeout?
```
✓ Check if port 587 is blocked
✓ Try port 465 with secure: true
✓ Disable antivirus/firewall temporarily
```

## Security Features

- ✅ 6-digit random OTP
- ✅ 10-minute expiration
- ✅ Max 5 verification attempts
- ✅ One-time use only
- ✅ Rate limiting (1 OTP/minute)
- ✅ bcrypt password hashing
- ✅ JWT tokens (15min access, 7day refresh)
- ✅ httpOnly cookies

## Production Checklist

- [ ] Replace Gmail with SendGrid/AWS SES
- [ ] Set up custom domain for emails
- [ ] Configure SPF/DKIM records
- [ ] Add email logging/monitoring
- [ ] Implement email queue system
- [ ] Add backup email provider
- [ ] Set up email analytics

## Support

📧 For issues: Check EMAIL_OTP_SETUP_GUIDE.md
📝 Full docs: AUTH_SYSTEM_DOCUMENTATION.md
