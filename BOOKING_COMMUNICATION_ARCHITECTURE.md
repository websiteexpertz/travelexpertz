# Yatra Expertz — Booking Communication System Architecture
**Document Version:** 1.0.0  
**Status:** Architecture Proposal & Specification  
**Target Environment:** Next.js 14+ App Router, Vercel Serverless, MongoDB Atlas

---

## 1. High-Level Architectural Diagram

```text
               +-------------------------------------------------------------+
               |                 Authoritative Booking Event                 |
               | (1. Cashfree PG verify webhook OR 2. Direct booking created)|
               +-------------------------------------------------------------+
                                              |
                                              v
               +-------------------------------------------------------------+
               |        Transactional Notification Outbox Enqueuer           |
               |  - Generates deterministic Idempotency Keys                 |
               |  - Enqueues immediate Confirmation Jobs (Email + WhatsApp)  |
               |  - Calculates & Enqueues Reminder Jobs (48h, 24h, 2h)       |
               +-------------------------------------------------------------+
                                              |
                                              v
                              +-------------------------------+
                              |     MongoDB Atlas Cluster     |
                              |  [booking_notifications]      |
                              +-------------------------------+
                                     |                ^
                Cron Trigger (1 min) |                | State Update
             (Vercel Cron / API)     v                | (SENT / FAILED)
               +-------------------------------------------------------------+
               |               Background Notification Processor             |
               |  - Atomic Lease Claiming (claimToken + leaseExpiresAt)      |
               |  - Bounded concurrency workers                              |
               |  - Strict channel decoupling                                |
               +-------------------------------------------------------------+
                                      /              \
                                     /                \
                                    v                  v
                 +-----------------------+   +-----------------------+
                 |  Email Worker Engine  |   | WhatsApp Worker Engine|
                 |  - Nodemailer SMTP    |   |  - Meta Cloud API     |
                 |  - PDF Voucher Attach |   |  - Approved Templates |
                 |  - Responsive HTML    |   |  - Document / PDF Link|
                 +-----------------------+   +-----------------------+
                                    |                  |
                                    v                  v
                             [ Customer Inbox ]  [ Customer Phone ]
```

---

## 2. Notification Database Schema Specification

A dedicated MongoDB collection named `booking_notifications` will persist all communication jobs.

### 2.1 TypeScript Interface Definition
```typescript
export type NotificationType =
  | "BOOKING_CONFIRMATION"
  | "REMINDER_48_HOURS"
  | "REMINDER_24_HOURS"
  | "REMINDER_2_HOURS"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "CHECKOUT_THANK_YOU"
  | "FINAL_INVOICE"
  | "REVIEW_REQUEST";

export type NotificationChannel = "EMAIL" | "WHATSAPP";

export type NotificationStatus =
  | "PENDING"
  | "PROCESSING"
  | "RETRY_SCHEDULED"
  | "ACCEPTED"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED"
  | "SKIPPED"
  | "DELIVERY_UNKNOWN"
  | "BLOCKED";

export interface BookingNotificationDocument {
  _id?: any; // MongoDB ObjectId
  bookingId: string; // Target Booking ObjectId string
  bookingReference?: string; // Human-readable reference (e.g. YE-123456)
  bookingVersion: number; // Incremented on rescheduling (invalidates previous reminders)
  customerId?: string; // Optional user account ID
  propertyId: string; // Hotel or Homestay ObjectId
  propertyType?: "hotel" | "homestay";
  propertyName?: string;

  type: NotificationType;
  channel: NotificationChannel;
  recipient: string; // Email address or E.164 formatted phone number (+91...)

  status: NotificationStatus;

  scheduledAt: Date; // UTC execution timestamp
  nextAttemptAt: Date; // For exponential backoff retries

  attempts: number; // Current attempt count (starts at 0)
  maxAttempts: number; // Default: 3

  idempotencyKey: string; // SHA-256 hash or deterministic composite key

  providerMessageId?: string; // Nodemailer messageId or Meta WhatsApp message ID
  
  claimToken?: string; // Unique worker UUID for the active lease
  leaseExpiresAt?: Date; // Distributed lock expiration timestamp

  lastErrorCode?: string; // Categorized error code (e.g. RATE_LIMIT, INVALID_RECIPIENT)
  lastErrorMessage?: string; // Sanitized failure summary

  acceptedAt?: Date;
  deliveredAt?: Date;

  payload?: {
    pdfType?: "VOUCHER" | "INVOICE";
    templateName?: string;
    variables?: Record<string, string | number>;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Index Strategy for Scalability & Concurrency
To ensure zero contention, high-throughput polling, and rapid cancellation, the following indexes are strictly specified:

1. **Deterministic Idempotency Index (Unique):**
   ```javascript
   { idempotencyKey: 1 }, { unique: true }
   ```
2. **Worker Polling & Lease Claiming Index (Compound):**
   ```javascript
   { status: 1, scheduledAt: 1, nextAttemptAt: 1, leaseExpiresAt: 1 }
   ```
3. **Booking Invalidation & Reschedule Index (Compound):**
   ```javascript
   { bookingId: 1, type: 1, status: 1 }
   ```
4. **Audit & Analytics Index:**
   ```javascript
   { recipient: 1, createdAt: -1 }
   ```

---

## 3. Distributed Locking & Atomic Lease Claiming

Because Next.js runs in serverless environments on Vercel where multiple function invocations can execute simultaneously, **in-memory locks and queues fail**.

The notification engine uses an **atomic MongoDB lease claiming pattern**:

```typescript
const claimToken = crypto.randomUUID();
const now = new Date();
const leaseDurationMs = 120_000; // 2 minutes lease window
const leaseExpiration = new Date(now.getTime() + leaseDurationMs);

const claimedJob = await notificationsCollection.findOneAndUpdate(
  {
    status: { $in: ["PENDING", "FAILED"] },
    attempts: { $lt: 3 },
    scheduledAt: { $lte: now },
    $or: [
      { nextAttemptAt: { $exists: false } },
      { nextAttemptAt: { $lte: now } }
    ],
    $or: [
      { leaseExpiresAt: { $exists: false } },
      { leaseExpiresAt: { $lt: now } }, // Reclaim stale/abandoned leases
      { status: "PENDING" }
    ]
  },
  {
    $set: {
      status: "PROCESSING",
      claimToken,
      leaseExpiresAt: leaseExpiration,
      updatedAt: now
    },
    $inc: { attempts: 1 }
  },
  { returnDocument: "after" }
);
```
- **Crash Recovery:** If a Vercel serverless function times out or crashes midway, `leaseExpiresAt` automatically elapses. On the subsequent run, any waiting worker can safely reclaim the job without human intervention.
- **Strict Decoupling:** Email and WhatsApp jobs are persisted as separate records (`channel: "EMAIL"`, `channel: "WHATSAPP"`). A failure or rate-limit stall in WhatsApp delivery will never block or delay Email delivery.

---

## 4. Scheduled Booking Reminders & Timezone Management

### 4.1 Reminder Calculation Rules
- Properties operate in Indian Standard Time (`Asia/Kolkata`, UTC+5:30).
- Standard Check-In time is evaluated (default: 12:00 PM / 14:00 PM on the check-in date).
- **Target Offsets:**
  - 48 Hours: `checkInDateTime - 48 hours`
  - 24 Hours: `checkInDateTime - 24 hours`
  - 2 Hours: `checkInDateTime - 2 hours`

### 4.2 Past-Time Skipping Logic
If a customer makes a last-minute booking (e.g., booking 10 hours before check-in):
- `scheduledAt` for 48h and 24h reminders is already in the past.
- The enqueuer checks: `if (scheduledAt <= new Date()) { status = "SKIPPED"; }`.
- Reminders that have already lapsed are persisted as `SKIPPED` for complete audit transparency without sending redundant spam to the customer.

### 4.3 Cancellation & Rescheduling Handlers
- **On Cancellation (`DELETE /api/bookings`):**
  - An atomic bulk update marks all un-sent jobs (`status: "PENDING"`) for that `bookingId` as `"CANCELLED"`.
  - Immediately enqueues a new `BOOKING_CANCELLED` notification job.
- **On Rescheduling / Date Modification:**
  - Increments `bookingVersion` by +1.
  - Voids pending reminder jobs matching old versions.
  - Enqueues fresh reminder jobs with new timestamps and enqueues a `BOOKING_RESCHEDULED` confirmation.

---

## 5. Execution Engine: Scheduler & Worker Endpoint

A protected serverless API endpoint serves as the processor runner:
- **Route:** `app/api/cron/process-notifications/route.ts`
- **Security:** Requires header `Authorization: Bearer ${process.env.CRON_SECRET}` (or `?secret=...`).
- **HTTP Methods:** Supports `GET` (for standard Vercel cron triggers) and `POST` (for manual/automated webhook pings).
- **Scheduler Plan Compatibility Notice:**
  - **Vercel Hobby Plan:** Supports only 1 cron invocation per day (`0 0 * * *`), not minute-by-minute execution.
  - **Vercel Pro Plan:** Supports up to 1-minute cron intervals (`* * * * *`).
  - **Alternative Schedulers (Zero-Cost):** If operating on a Hobby plan without upgrading, an external cron pinger (e.g. cron-job.org, Upstash QStash, or GitHub Actions workflow) can invoke this protected endpoint at regular 1–5 minute intervals without violating platform limits.
- **Bounded Concurrency & Timeouts:** Each run processes a maximum batch size (e.g. 20 jobs) with bounded `Promise.allSettled`. The worker aborts claiming new jobs before serverless execution deadlines (e.g. 10s budget) to prevent forced timeouts.

---

## 6. Document Generation Architecture (PDF Voucher & Invoice)

### 6.1 Serverless PDF Generation Strategy
- **Engine Selection:** Lightweight Node.js library (`pdfkit`) running within standard Vercel serverless memory limits (no Chromium/Puppeteer overhead).
- **Voucher Specification:**
  - Header with YatraExpertz logo & 24/7 support hotline.
  - Booking Reference code & QR Code for property check-in.
  - Property details, address, Google Maps link, and host contact.
  - Guest names, check-in / check-out dates, room tier, and meal plans.
  - Detailed payment breakdown (Amount Paid, Balance Due at Property).
- **Invoice Specification:**
  - Legal GST Tax Invoice format conforming to Indian tax regulations.
  - Supplier details (GSTIN, registered address), SAC code, CGST/SGST/IGST breakdown.
- **Storage / Delivery:**
  - Generated dynamically as an in-memory `Buffer` and attached directly to the Nodemailer email.
  - Stored in MongoDB GridFS or cloud bucket to provide a secure download link for WhatsApp messages.

---

## 7. WhatsApp Integration Specification

### 7.1 Provider: Meta WhatsApp Business Cloud API
- **Endpoint:** `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v21.0'}/${PHONE_NUMBER_ID}/messages`
  *(Note: Graph API version is configurable via environment variable and defaults to active v21.0; expired versions like v19.0 are strictly disallowed).*
- **Business Number Coexistence:** Existing WhatsApp number (`+91 8923992522`) must be verified before migration to Cloud API WABA to ensure zero disruption to current customer chat support.
- **Authentication:** System User Permanent Access Token (`WHATSAPP_CLOUD_ACCESS_TOKEN`).
- **Template System:** Transactional utility templates pre-registered with Meta:
  1. `booking_confirmation_v1`: Header (Property Name), Body (Guest Name, Dates, Ref, Total Paid, Balance), Button (View Booking Voucher).
  2. `booking_reminder_48h`: Reminder notice, directions, check-in instructions.
  3. `booking_reminder_24h`: Final preparation checklist, property host contact.
  4. `booking_reminder_2h`: "Welcome soon" message, reception phone number.
  5. `booking_checkout_thanks`: Thank you message, link to download finalized tax invoice, review invitation.
  6. `booking_cancelled_notice`: Cancellation confirmation and refund processing timeline.
- **Webhooks:** Handler at `app/api/webhooks/whatsapp/route.ts` captures delivery and read receipts (`DELIVERED`, `READ`), updating notification records in MongoDB.

---

## 8. Property Checkout & Review Integration Architecture

### 8.1 Staff / Admin Checkout Confirmation
- Actual guest checkout is **strictly initiated by authorized property staff or an admin** via the Owner or Admin dashboard.
- Automatic completion of bookings by background timers is strictly forbidden to prevent inaccurate billing or premature checkout records.
- Schedulers may dispatch gentle reminders to staff to verify guest departure, but will never mutate booking lifecycle state to completed without staff sign-off.
- Final tax invoices require finalized billing information before generation.

### 8.2 Automated Review Link Generation
- Following verified checkout confirmation by staff, the system generates a signed, tokenized URL:
  `https://www.yatraexpertz.com/reviews/submit?token={JWT_OR_SECURE_TOKEN}&bookingId={ID}`
- Token encodes `bookingId`, `propertyId`, and `customerId`.
- The review submission form validates the token against the booking database:
  - Ensures the booking was actually completed.
  - Prevents fraudulent or duplicate reviews.
  - Automatically tags the submitted review with `verified: true`.
- Approved reviews appear dynamically on the property details page and the homepage "Stories of Happy Journeys" section.

---

## 9. Error Handling, Exponential Backoff & Circuit Breaking

- **Retry Policy:** Maximum 3 attempts with exponential backoff:
  - Attempt 1: Immediate.
  - Attempt 2: After 5 minutes (`nextAttemptAt = now + 5 min`).
  - Attempt 3: After 30 minutes (`nextAttemptAt = now + 30 min`).
- **Permanent Failure Classification:**
  - Invalid email syntax or WhatsApp non-existent number (Meta Error 131026) immediately sets `status: "FAILED"` without further retries.
  - Transient network or SMTP timeouts trigger standard backoff.
