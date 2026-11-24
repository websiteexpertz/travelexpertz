# Yatra Expertz — Booking Communication Implementation Plan (Phases 2–8)
**Document Version:** 1.0.0  
**Status:** Implementation Roadmap (Pending User Approval)

---

## Roadmap Overview

```text
  +------------------------------------------------------------------------+
  | Phase 1: Audit & Architecture Specification (COMPLETED)                |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 2: Data Layer, Notification Models & Distributed Queue Engine    |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 3: Serverless PDF Document Generator (Vouchers & Tax Invoices)   |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 4: Production Email Delivery Service & Responsive HTML Templates  |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 5: Meta WhatsApp Cloud API Service & Transactional Templates     |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 6: Authoritative Booking Lifecycle Hook Integration              |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 7: Automated Reminder Scheduler & Vercel Cron Runner             |
  +------------------------------------------------------------------------+
                                      |
                                      v
  +------------------------------------------------------------------------+
  | Phase 8: Operational Checkout Flow, Verified Reviews & Final QA       |
  +------------------------------------------------------------------------+
```

---

## Phase 2: Data Layer, Notification Models & Distributed Queue Engine

### Objective
Establish the persistent transactional outbox and distributed atomic queue in MongoDB Atlas.

### Action Items
1. **Model Definitions:** Create `lib/models/notification.ts` exporting strict TypeScript interfaces and types for `BookingNotificationDocument`.
2. **Collection & Indexes Setup:**
   - Write migration/indexing utility in `lib/db/init-notifications.ts`.
   - Create unique compound index on `idempotencyKey`.
   - Create compound index on `{ status: 1, scheduledAt: 1, nextAttemptAt: 1, leaseExpiresAt: 1 }`.
   - Create index on `{ bookingId: 1, type: 1, status: 1 }`.
3. **Queue Service:**
   - Create `lib/services/notifications/queue.ts` implementing:
     - `enqueueNotification(job: Partial<BookingNotificationDocument>): Promise<string>`
     - `claimPendingNotifications(batchSize: number, workerId: string): Promise<BookingNotificationDocument[]>`
     - `completeNotification(id: string, providerMessageId: string): Promise<void>`
     - `failNotification(id: string, error: string, retryable: boolean): Promise<void>`
     - `cancelPendingNotificationsForBooking(bookingId: string): Promise<number>`
4. **Unit Verification:** Verify schema compilation and connection pooling re-use.

---

## Phase 3: Serverless PDF Document Generator (Vouchers & Tax Invoices)

### Objective
Implement high-performance, serverless-friendly PDF generation for customer booking vouchers and GST-compliant tax invoices.

### Action Items
1. **Dependency Installation:**
   - Install `pdfkit` and `@types/pdfkit` (lightweight, zero-native binary overhead).
2. **Booking Voucher Generator:**
   - Create `lib/services/pdf/voucher.ts`.
   - Renders YatraExpertz branding, booking reference, check-in QR code, property address, host contact, guest breakdown, and payment summary.
   - Outputs memory `Buffer`.
3. **Tax Invoice Generator:**
   - Create `lib/services/pdf/invoice.ts`.
   - Generates compliant GST invoices featuring SAC code 996311 (Accommodation services), CGST/SGST/IGST breakdown, company GSTIN, and customer details.
4. **Voucher Storage Utility:**
   - Integrate with MongoDB GridFS via `lib/services/pdf/storage.ts` for temporary or persistent public download links when delivering via WhatsApp.

---

## Phase 4: Production Email Delivery Service & Responsive HTML Templates

### Objective
Enhance existing Nodemailer SMTP infrastructure to support PDF attachments, multi-part MIME, and responsive HTML email templates.

### Action Items
1. **Update Email Service:**
   - Modify `lib/services/email.ts` to accept optional `attachments: Array<{ filename: string; content: Buffer; contentType: string }>`.
2. **Template Engine:**
   - Create `lib/templates/emails/`:
     - `booking-confirmation.html.ts`: Rich confirmation template with stay summary, property photos, check-in instructions, and CTA to view stay details.
     - `booking-reminder-48h.html.ts`: 48-hour pre-arrival travel tips and hotel navigation.
     - `booking-reminder-24h.html.ts`: 24-hour packing guide, host contact, and check-in confirmation.
     - `booking-reminder-2h.html.ts`: "We're waiting for you" greeting with front desk telephone.
     - `booking-cancellation.html.ts`: Cancellation acknowledgement and refund breakdown.
     - `checkout-thankyou.html.ts`: Post-stay thank-you note with attached tax invoice and review link.
3. **Worker Implementation:**
   - Create `lib/services/notifications/email-worker.ts` to consume claimed jobs, render templates, generate PDF buffers, and invoke `sendEmail`.

---

## Phase 5: Meta WhatsApp Cloud API Service & Transactional Templates

### Objective
Integrate official Meta WhatsApp Business Cloud API to deliver automated transactional WhatsApp notifications using supported Graph API versions (v21.0+).

### Action Items
1. **Provider Client:**
   - Create `lib/services/whatsapp/client.ts` encapsulating authenticated REST calls to `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v21.0'}/{PHONE_NUMBER_ID}/messages`.
   - Prevent usage of expired Graph API versions (such as v19.0).
   - Ensure phone number verification logic to avoid disrupting the active `WhatsAppChat.tsx` direct assistance widget.
2. **Template Registration & Mapping:**
   - Map parameters for pre-approved templates:
     - `yatra_booking_confirmation`
     - `yatra_stay_reminder`
     - `yatra_checkout_invoice`
     - `yatra_booking_cancellation`
3. **Document Message Support:**
   - Implement document message dispatch sending secure public PDF links to customers.
4. **Webhook Handler:**
   - Implement `app/api/webhooks/whatsapp/route.ts` with webhook secret verification (`hub.challenge`) and status event processor (`sent`, `delivered`, `read`, `failed`).
5. **Worker Implementation:**
   - Create `lib/services/notifications/whatsapp-worker.ts` to process claimed WhatsApp jobs independently from email workers.

---

## Phase 6: Authoritative Booking Lifecycle Hook Integration

### Objective
Connect the notification enqueueing engine to authoritative booking confirmation, modification, and cancellation events.

### Action Items
1. **Cashfree Payment Verification Hook:**
   - In `app/api/payments/cashfree/verify/route.ts`:
   - Upon confirming `order.order_status === "PAID"`, immediately invoke `enqueueBookingConfirmedNotifications(bookingId)`.
2. **Direct Booking Hook:**
   - In `app/api/bookings/route.ts` (POST):
   - For confirmed direct bookings (`paymentInitiated: false`), invoke `enqueueBookingConfirmedNotifications(bookingId)`.
   - Update owner email to use unified template engine.
3. **Booking Cancellation Hook:**
   - In `app/api/bookings/route.ts` (DELETE):
   - Void pending reminders with `cancelPendingNotificationsForBooking(bookingId)`.
   - Enqueue immediate `BOOKING_CANCELLED` jobs for Email and WhatsApp.
4. **Rescheduling / Update Hook:**
   - In `app/api/bookings/route.ts` (PATCH):
   - Recalculate check-in offsets, void old reminders, and enqueue updated schedules.

---

## Phase 7: Automated Reminder Scheduler & Runner Engine

### Objective
Deploy a continuous background scheduler to process due jobs and reminders reliably, respecting platform plan limits.

### Action Items
1. **Cron API Endpoint:**
   - Create `app/api/cron/process-notifications/route.ts`.
   - Enforce authorization header checking against `process.env.CRON_SECRET`.
   - Support GET and POST methods.
2. **Job Processor Pipeline:**
   - Worker queries `booking_notifications` for due jobs (`scheduledAt <= now`).
   - Atomically claims batch using `claimToken` and `leaseExpiresAt`.
   - Executes Email and WhatsApp workers in parallel using `Promise.allSettled`.
   - Updates execution statuses (`ACCEPTED`, `DELIVERED`, `RETRY_SCHEDULED`, `FAILED`), increments attempt counts, and schedules backoff.
3. **Scheduler Integration:**
   - For Vercel Pro plans: configure `vercel.json` with cron schedule `* * * * *`.
   - For Vercel Hobby plans (which only support daily cron `0 0 * * *`): configure an external pinger (e.g. cron-job.org, Upstash QStash, or GitHub Actions) triggering the secured endpoint at 1-minute intervals.
4. **Timezone Calculation Helper:**
   - Implement `lib/utils/timezone.ts` to accurately compute 48h, 24h, and 2h offsets relative to property check-in time in `Asia/Kolkata`.

---

## Phase 8: Operational Checkout Flow, Verified Reviews & Final QA

### Objective
Add authorized staff check-out triggers, tokenized verified reviews, and execute end-to-end sandbox testing.

### Action Items
1. **Owner / Admin Checkout Action:**
   - Add "Confirm Check-Out" button in `app/owner/bookings/page.tsx` and `app/admin/bookings/page.tsx`.
   - Updates `bookingStatus: "completed"`, records `checkedOutAt: new Date()`, and immediately triggers thank-you notification, finalized tax invoice, and review invitation.
2. **Staff Checkout Reminder:**
   - For bookings where manual checkout was not recorded past checkout time, dispatch reminder to property staff/owner to verify guest departure and complete checkout. *(Automated transition to completed without human confirmation is strictly prohibited).*
3. **Tokenized Review System:**
   - Create `app/reviews/submit/page.tsx` supporting rating, comments, and media uploads.
   - Enforce validation against signed booking token to guarantee verified stay badge.
4. **End-to-End Simulation & Verification:**
   - Execute dry-run test suite simulating:
     - Cashfree payment confirmation -> Immediate Email + WhatsApp voucher delivery.
     - Reminder scheduling -> Skip past dates, trigger due reminders.
     - Cancellation -> Instant void of pending jobs + cancellation receipt.
     - Checkout -> Immediate GST Invoice + Review invitation.
5. **Monitoring & Health Dashboard:**
   - Expose notification delivery stats in `app/admin/notifications/page.tsx` for admin visibility.
