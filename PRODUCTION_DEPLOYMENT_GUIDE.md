# Yatra Expertz — Production Deployment Guide

**Target Environment:** Vercel Production (`https://www.yatraexpertz.com/`)  
**Scope:** Booking Communication, Document Generation, Stay Lifecycle & Reviews Engine  
**Release:** Final Production Rollout (Phases 1–8)

---

## 1. Pre-Deployment Readiness Verification

Before triggering a production build or deployment:

1. **Verify TypeScript Compilation:**
   ```bash
   npx tsc --noEmit
   ```
   *Expected:* Exit code `0` (Zero errors).

2. **Verify Next.js Production Build:**
   ```bash
   npx next build --webpack
   ```
   *Expected:* Exit code `0`, all 148 static and dynamic routes compiled successfully.

3. **Verify Full Test Regression Suite:**
   ```bash
   node scripts/run-all-tests.js
   ```
   *Expected:* `260 / 260` automated tests passing cleanly across Phases 2 through 8.

4. **Verify Live SMTP Connection:**
   Run the live verification test against Zoho SMTP:
   ```bash
   node scripts/test-zoho-live.js
   ```
   *Expected:* `✅ Zoho SMTP Connection Successfully Verified! Credentials & Handshake OK.`

---

## 2. Step-by-Step Vercel Deployment Sequence

### Step 1: Environment Variables Setup in Vercel
Log in to the Vercel Dashboard for `yatraexpertz` and navigate to **Project Settings > Environment Variables**:
1. Add / Update the following production variables:
   - `SMTP_HOST`: `smtppro.zoho.in`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `noreply@yatraexpertz.com`
   - `SMTP_PASSWORD`: `[Verified Zoho Application Password]`
   - `SMTP_SECURE`: `false`
   - `BOOKING_EMAIL_ENABLED`: `true`
   - `BOOKING_WHATSAPP_ENABLED`: `false` (MUST remain `false`)
   - `CRON_SECRET`: `[High-entropy 32-byte secret]`
   - `CASHFREE_ENV`: `production`
2. Ensure `WHATSAPP_` credentials remain in placeholder / inactive state.

### Step 2: Database Indexes Setup (MongoDB Atlas)
Verify that the following indexes exist on MongoDB Atlas:
```javascript
// booking_notifications collection
db.booking_notifications.createIndex({ idempotencyKey: 1 }, { unique: true });
db.booking_notifications.createIndex({ status: 1, scheduledFor: 1, nextAttemptAt: 1 });
db.booking_notifications.createIndex({ bookingId: 1, type: 1 });
db.booking_notifications.createIndex({ createdAt: -1 });

// booking_reviews collection
db.booking_reviews.createIndex({ bookingId: 1 }, { unique: true });
db.booking_reviews.createIndex({ propertyId: 1, moderationStatus: 1, createdAt: -1 });
db.booking_reviews.createIndex({ featuredOnHomepage: 1, moderationStatus: 1 });

// booking_documents.files collection
db.booking_documents.files.createIndex({ "metadata.bookingId": 1, "metadata.type": 1 });
db.booking_documents.files.createIndex({ "metadata.documentNumber": 1 }, { unique: true, sparse: true });
```

### Step 3: Trigger Controlled Production Deployment
Deploy the verified branch using the standard Vercel Git integration or CLI.

### Step 4: Post-Deployment Smoke Verification
Immediately following deployment:
1. Access the Admin Communication Center at `https://www.yatraexpertz.com/admin/communications`.
2. Inspect the **Live Service Health & Diagnostics** card:
   - Ensure MongoDB connection is `HEALTHY`.
   - Ensure Email Provider is `OPERATIONAL` (Zoho SMTP).
   - Ensure WhatsApp Provider is `STANDBY / READY (Disabled)`.
3. Check the Vercel Crons dashboard to confirm that `/api/cron/process-notifications` triggers every minute.
4. Perform a controlled test booking in sandbox or staging to verify:
   - Booking confirmation email arrives with accurate styling.
   - PDF Booking Voucher is generated in GridFS and downloadable via signed token.
   - Notification timeline reflects `SENT` status in `/admin/bookings`.
