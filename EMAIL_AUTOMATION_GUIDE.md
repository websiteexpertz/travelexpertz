# Yatra Expertz — Automated Email Integration Guide

## 1. Overview
The Yatra Expertz automated email integration delivers transactional customer communications using Nodemailer and Gmail SMTP. The implementation provides:
- Decoupled asynchronous delivery via the distributed notification queue.
- Reusable connection-pooled SMTP transporter (`pool: true, maxConnections: 5`).
- Mobile-responsive, email-client-compatible HTML layouts with navy and brand blue (`#0b6dff`) styling.
- Complete plain-text fallbacks for accessibility and anti-spam deliverability.
- Atomic leasing, idempotency, and exponential backoff retry tracking.

---

## 2. Configuration & Environment Variables
The email integration reads the following environment variables:

```env
# Feature Flag (Default: false in live unless explicitly enabled)
BOOKING_EMAIL_ENABLED=true

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587                     # 587 for STARTTLS (recommended) or 465 for SSL
SMTP_USER=bookings@yatraexpertz.com  # Official Gmail or Google Workspace address
SMTP_PASSWORD=abcd efgh ijkl mnop  # 16-character Google App Password (not standard account password)
SMTP_FROM="YatraExpertz" <bookings@yatraexpertz.com>
SMTP_REPLY_TO=support@yatraexpertz.com

# Cron Scheduler Security
CRON_SECRET=your_secure_random_cron_secret
```

> [!TIP]
> **Google App Password Requirement**: If using Google Workspace or Gmail with 2-Step Verification, generate an App Password via [Google Account Security](https://myaccount.google.com/apppasswords) under the "Mail" app type. Do not use your regular account password.

---

## 3. Supported Email Templates
Foundations for all 9 canonical notification events are implemented in `lib/services/notifications/email-templates.ts`:

1. **`BOOKING_CONFIRMATION`** *(Active in Phase 2.1)*:
   - Full booking details: Customer Name, Reference, Status Badge, Property Name, Address, City, State, Check-in (From 12:00 PM), Check-out (Until 11:00 AM), Room Category, Nights, Guests Count, Financial Breakdown (Total, Paid, Outstanding at Property), Cancellation Policy, and "View Complete Booking Details" CTA button.
2. **`REMINDER_48_HOURS`**: 48-hour pre-trip reminder with dates and directions.
3. **`REMINDER_24_HOURS`**: 24-hour reminder with check-in instructions and photo ID guidance.
4. **`REMINDER_2_HOURS`**: Day-of-travel 2-hour arrival notification.
5. **`BOOKING_RESCHEDULED`**: Date change confirmation.
6. **`BOOKING_CANCELLED`**: Cancellation voucher with refund guidance.
7. **`CHECKOUT_THANK_YOU`**: Post-checkout thank you message with review link.
8. **`FINAL_INVOICE`**: Finalized billing statement.
9. **`REVIEW_REQUEST`**: Invitation to submit star ratings and photos for *Stories of Happy Journeys*.

---

## 4. Triggering Booking Confirmation Emails

### Online Cashfree Bookings
- When a customer completes checkout, Cashfree redirects to `/booking/confirm` which calls `/api/payments/cashfree/verify`.
- Upon verified order status `PAID`, the backend marks the booking as confirmed in MongoDB and enqueues the notification intent:
  ```typescript
  await enqueueBookingConfirmedNotifications(bookingId, { database: db });
  ```
- **Duplicate Protection**: Repeated verifications or browser refreshes check `isAlreadyPaid`. The SHA-256 idempotency key prevents duplicate email records.

### Direct & Pay-at-Property Bookings
- When an administrator or guest confirms a booking via `/api/bookings` with `bookingStatus: "confirmed"`, the notification intent is enqueued immediately with accurate balance calculations (`paidAmount: 0`, `outstandingAmount: totalPrice`).

---

## 5. Background Notification Worker Execution
Email jobs are picked up asynchronously by the worker endpoint:
```
GET /api/cron/process-notifications
Authorization: Bearer <CRON_SECRET>
```

### Worker Architecture:
1. **Atomic Leasing**: Claims up to 20 eligible pending jobs (`PENDING` or `RETRY_SCHEDULED`) with a 120-second lease to prevent dual delivery across parallel instances.
2. **Bounded Concurrency**: Dispatches jobs concurrently via `Promise.allSettled`.
3. **Execution Deadline**: Tracks 25-second execution budget to complete cleanly within Vercel's 30-second serverless execution window.
4. **Outcome Tracking**:
   - Successful dispatch records `status: "ACCEPTED"` and captures the SMTP `providerMessageId`.
   - Permanent errors (e.g. invalid email format) mark `status: "BLOCKED"` without wasting retries.
   - Transient errors (connection timeouts, rate limits) schedule exponential backoff retries (1m &rarr; 2m &rarr; 4m).

---

## 6. Controlled SMTP Testing Procedure
To verify live SMTP delivery before unrestricted production activation:

1. **Local Safe Testing**:
   - Set `NOTIFICATION_TEST_MODE=true` in `.env.local`.
   - The adapter generates mock delivery receipts with zero external network calls.
2. **Controlled Real Recipient Test**:
   - Set `NOTIFICATION_TEST_MODE=false`.
   - Create a test booking using your specifically authorized personal/team email address (e.g., `deepansh@experzt.in`).
   - Trigger the worker via `curl`:
     ```bash
     curl -X GET "http://localhost:3000/api/cron/process-notifications?secret=your_cron_secret"
     ```
   - Verify that the email arrives in your inbox with:
     - Sender: `"YatraExpertz" <bookings@yatraexpertz.com>`
     - Responsive styling, valid dates, prices, and clickable link to `https://www.yatraexpertz.com/booking/confirm?bookingId=...`.

---

## 7. Production Scheduler Options (Vercel)
Timely confirmation delivery requires invoking `/api/cron/process-notifications` on a recurring schedule.

1. **Option A: Vercel Cron (Configured in `vercel.json`)**:
   - On Vercel Pro plans, crons can run at minute-level intervals (e.g., `* * * * *`).
   - On Vercel Hobby plans, crons run at most once per day.
2. **Option B: Upstash QStash / External Scheduled Pinger (Recommended for Hobby Plans)**:
   - Configure a free QStash scheduled message or Cloudflare Worker cron that pings `https://www.yatraexpertz.com/api/cron/process-notifications` every 1 minute with the `Authorization: Bearer <CRON_SECRET>` header.

---

## 8. Troubleshooting & Diagnostics

| Symptom | Probable Cause | Remediation |
|---|---|---|
| `535 5.7.8 Username and Password not accepted` | Standard password used instead of Google App Password | Generate a new 16-character Google App Password in Gmail account settings. |
| `ETIMEDOUT` on port 587 | Cloud/host firewall blocks outbound port 587 | Switch to `SMTP_PORT=465` with `secure: true`. |
| `INVALID_EMAIL_RECIPIENT` | Guest entered malformed email during booking | Job automatically marked `BLOCKED`. Guest can still view voucher online via phone number. |
| Email marked `ACCEPTED` but not in inbox | Spam/Junk folder filtering | Ensure SPF, DKIM, and DMARC DNS records are configured for your sending domain. |
