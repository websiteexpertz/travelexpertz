# Complete Authentication System Documentation

## Database Schema (MongoDB Collections)

### 1. users
```javascript
{
  _id: ObjectId,
  mobile: String (unique, indexed),
  password: String (hashed with bcrypt),
  mobileVerified: Boolean,
  isActive: Boolean,
  role: String ("user" | "admin" | "host"),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. user_profiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users._id),
  name: String,
  email: String,
  gender: String ("male" | "female" | "other"),
  dateOfBirth: Date,
  nationality: String,
  maritalStatus: String ("single" | "married" | "divorced" | "widowed"),
  anniversaryDate: Date,
  alternateContact: String,
  city: String,
  state: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. otp_verifications
```javascript
{
  _id: ObjectId,
  mobile: String (indexed),
  otp: String (6-digit),
  purpose: String ("signup" | "login" | "reset_password"),
  expiresAt: Date (indexed),
  verified: Boolean,
  attempts: Number (max: 5),
  createdAt: Date
}
```

### 4. refresh_tokens
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users._id),
  token: String,
  expiresAt: Date (indexed),
  deviceInfo: String,
  ipAddress: String,
  createdAt: Date
}
```

### 5. bookings
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users._id),
  bookingId: String (unique, e.g., "BK1234ABCD"),
  propertyId: ObjectId,
  propertyName: String,
  propertyType: String ("hotel" | "homestay" | "package"),
  city: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  rooms: Number,
  totalAmount: Number,
  bookingStatus: String ("confirmed" | "completed" | "cancelled" | "pending"),
  paymentStatus: String ("paid" | "pending" | "refunded" | "failed"),
  paymentMode: String,
  transactionId: String,
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. wishlist
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users._id),
  propertyId: ObjectId,
  propertyType: String ("hotel" | "homestay" | "package"),
  propertyName: String,
  city: String,
  price: Number,
  image: String,
  rating: Number,
  createdAt: Date
}
```

### 7. transactions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users._id),
  bookingId: ObjectId (ref: bookings._id),
  transactionId: String (unique, e.g., "TXN1234ABCDEF"),
  amount: Number,
  paymentMode: String ("card" | "upi" | "netbanking" | "wallet" | "cash"),
  status: String ("success" | "failed" | "refunded" | "pending"),
  description: String,
  createdAt: Date
}
```

## API Endpoints

### Authentication APIs

#### 1. Send OTP
```
POST /api/auth/send-otp
Body: {
  "mobile": "9876543210",
  "purpose": "signup" // or "login", "reset_password"
}
Response: {
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

#### 2. Verify OTP
```
POST /api/auth/verify-otp
Body: {
  "mobile": "9876543210",
  "otp": "123456",
  "purpose": "signup"
}
Response: {
  "success": true,
  "message": "OTP verified successfully",
  "mobile": "9876543210",
  "verified": true
}
```

#### 3. Signup (After OTP Verification)
```
POST /api/auth/signup
Body: {
  "mobile": "9876543210",
  "password": "SecurePass123",
  "name": "John Doe"
}
Response: {
  "success": true,
  "message": "Signup successful!",
  "user": { "id": "...", "mobile": "9876543210", "name": "John Doe" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### 4. Login
```
POST /api/user/login
Body: {
  "mobile": "9876543210",
  "password": "SecurePass123"
}
Response: {
  "success": true,
  "message": "Login successful!",
  "user": { "id": "...", "mobile": "9876543210", "name": "John Doe", "role": "user" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### 5. Logout
```
POST /api/user/logout?all=true
Response: {
  "success": true,
  "message": "Logged out from all devices"
}
```

### Profile APIs

#### 1. Get Profile
```
GET /api/user/profile
Headers: Cookie: accessToken=...
Response: {
  "user": { "id": "...", "mobile": "9876543210", ... },
  "profile": { "name": "John Doe", "email": "john@example.com", ... }
}
```

#### 2. Update Profile
```
PUT /api/user/profile
Headers: Cookie: accessToken=...
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "nationality": "Indian",
  "maritalStatus": "married",
  "anniversaryDate": "2020-06-15",
  "alternateContact": "9876543211",
  "city": "Mumbai",
  "state": "Maharashtra"
}
Response: {
  "success": true,
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

#### 3. Change Password
```
PATCH /api/user/profile
Headers: Cookie: accessToken=...
Body: {
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
Response: {
  "success": true,
  "message": "Password changed successfully"
}
```

### Booking APIs

#### Get Bookings
```
GET /api/user/bookings?status=upcoming
Headers: Cookie: accessToken=...
Response: {
  "bookings": [ ... ],
  "count": 5
}

Query params:
- status: "upcoming" | "completed" | "cancelled" (optional)
```

### Wishlist APIs

#### 1. Get Wishlist
```
GET /api/user/wishlist
Headers: Cookie: accessToken=...
Response: {
  "wishlist": [ ... ],
  "count": 10
}
```

#### 2. Add to Wishlist
```
POST /api/user/wishlist
Headers: Cookie: accessToken=...
Body: {
  "propertyId": "507f1f77bcf86cd799439011",
  "propertyType": "hotel",
  "propertyName": "Grand Hotel",
  "city": "Mumbai",
  "price": 5000,
  "image": "/images/hotel.jpg",
  "rating": 4.5
}
Response: {
  "success": true,
  "message": "Added to wishlist"
}
```

#### 3. Remove from Wishlist
```
DELETE /api/user/wishlist?id=507f1f77bcf86cd799439011
Headers: Cookie: accessToken=...
Response: {
  "success": true,
  "message": "Removed from wishlist"
}
```

### Transaction APIs

#### Get Transactions
```
GET /api/user/transactions
Headers: Cookie: accessToken=...
Response: {
  "transactions": [ ... ],
  "count": 20
}
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
3. **OTP Security**:
   - 10-minute expiry
   - Maximum 5 attempts
   - 1-minute cooldown between requests
4. **Password Requirements**:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
5. **Mobile Validation**: 10-digit Indian mobile format (starts with 6-9)

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# SMS Provider (example for Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Or for other SMS providers
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=TXPERT
```

## Files Created

### Backend (API Routes)
- `/app/api/auth/send-otp/route.ts`
- `/app/api/auth/verify-otp/route.ts`
- `/app/api/auth/signup/route.ts`
- `/app/api/user/login/route.ts`
- `/app/api/user/logout/route.ts`
- `/app/api/user/profile/route.ts`
- `/app/api/user/bookings/route.ts`
- `/app/api/user/wishlist/route.ts`
- `/app/api/user/transactions/route.ts`

### Libraries & Utilities
- `/lib/db.ts` - Database connection
- `/lib/models/User.ts` - TypeScript interfaces
- `/lib/jwt.ts` - JWT token utilities
- `/lib/middleware/auth.ts` - Authentication middleware
- `/lib/utils/auth.ts` - Auth helper functions
- `/lib/services/sms.ts` - SMS/OTP service

### Dependencies to Install
```bash
npm install bcryptjs jsonwebtoken mongodb
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

# For SMS (choose one based on your provider)
npm install twilio  # For Twilio
# or
npm install aws-sdk  # For AWS SNS
# or use any Indian SMS provider SDK
```

## Next Steps

1. **Frontend Pages**: Create login, register, profile, bookings, wishlist pages
2. **Header Integration**: Add login/logout buttons and user menu
3. **SMS Integration**: Connect with actual SMS provider (Twilio, AWS SNS, MSG91)
4. **Payment Integration**: Add payment gateway (Razorpay, Stripe, PayU)
5. **Booking Flow**: Complete booking creation with payment
6. **Email Notifications**: Send booking confirmations via email
7. **Admin Panel**: Manage users, bookings, transactions

## Usage Flow

### User Registration
1. User enters mobile number → Click "Send OTP"
2. Backend sends OTP via SMS
3. User enters OTP → Verifies
4. User sets password → Creates account
5. User is logged in automatically

### User Login
1. User enters mobile + password
2. Backend validates credentials
3. Returns JWT tokens
4. Frontend stores tokens in cookies
5. User is logged in

### Protected Routes
All authenticated endpoints check for valid access token in cookies or Authorization header.
