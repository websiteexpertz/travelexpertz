# Yatra Expertz — Booking Communication Engine: Final Architecture

**Production Domain:** [https://www.yatraexpertz.com/](https://www.yatraexpertz.com/)  
**Release Version:** Production Ready (Phases 1–8 Completed)  
**Technology Stack:** Next.js 16 (App Router), TypeScript, MongoDB Atlas, GridFS, PDFKit, Zoho/Gmail SMTP, Nodemailer, Cashfree Payment Gateway, Meta WhatsApp Business Cloud API (Prepared).

---

## 1. System Overview & Architectural Topology

The Yatra Expertz Booking Communication Engine is a modular, event-driven, production-grade notification, document generation, lifecycle tracking, and guest feedback platform. It coordinates all guest, host, and admin communications across the complete lifecycle of hotel and homestay reservations.

```
                                  ┌────────────────────────┐
                                  │   Guest / User Action  │
                                  │ (Book / CheckIn / Rev) │
                                  └───────────┬────────────┘
                                              │
                                              ▼
┌──────────────────────┐         ┌─────────────────────────┐         ┌──────────────────────┐
│  Cashfree Webhook /  ├────────►│   Next.js API Layer     │◄────────┤  Cron Worker / Admin │
│  Payment Verification│         │ (/api/bookings, verify) │         │ (/api/cron/process)  │
└──────────────────────┘         └────────────┬────────────┘         └──────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
       ┌─────────────────────────────┐                 ┌─────────────────────────────┐
       │   Stay Lifecycle Engine     │                 │   Notification Queue Engine │
       │ (Check-in, Checkout, Bill)  │                 │ (Enqueuer, Idempotency Gen) │
       └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                      │                                               │
                      ▼                                               ▼
       ┌─────────────────────────────┐                 ┌─────────────────────────────┐
       │  PDF Engine & GridFS Vault  │                 │  MongoDB Collection Layer   │
       │ (Vouchers, Invoices, Token) │                 │ (booking_notifications, etc)│
       └─────────────────────────────┘                 └──────────────┬──────────────┘
                                                                      │
                                                                      ▼
                                                       ┌─────────────────────────────┐
                                                       │  Notification Processor     │
                                                       │ (Capacity Limiter, Worker)  │
                                                       └──────────────┬──────────────┘
                                                                      │
                                              ┌───────────────────────┴───────────────────────┐
                                              ▼                                               ▼
                               ┌─────────────────────────────┐                 ┌─────────────────────────────┐
                               │  Email Adapter (Active)     │                 │ WhatsApp Adapter (Prepared) │
                               │ (Zoho/Gmail SMTP TLS/587)   │                 │ (Meta Cloud API Graph v21.0)│
                               └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## 2. Core Subsystems & Components

### 2.1 Notification Queue & Idempotency Engine (`lib/services/notifications/queue.ts`)
- **Queue Collection:** `booking_notifications` in MongoDB Atlas.
- **Statuses:** `PENDING`, `PROCESSING`, `SENT`, `FAILED`, `CANCELLED`.
- **Deterministic Idempotency Key:** SHA-256 hash formatted as `sha256(bookingId:type:channel:scheduledTimestamp:recipient)`.
  - Guarantees zero duplicate job enqueuing regardless of repeated webhook calls, user refreshes, or administrative retries.
- **Grace Period Scheduling:** 15-minute grace window evaluated dynamically against scheduled delivery timestamps.

### 2.2 Dispatcher & Notification Processor (`lib/services/notifications/processor.ts`)
- **Worker Execution:** Invoked via `/api/cron/process-notifications` (secured by `Bearer CRON_SECRET` or Vercel cron headers) and manual worker pulse `/api/admin/communications/worker`.
- **Concurrency & Rate Limiting:**
  - Configurable worker batch size (default 20 jobs/min).
  - Exponential backoff with jitter on transient failures (`nextAttemptAt = now + 2^(retryCount) * baseDelay`).
  - Strict maximum retry cap of 3 attempts before moving to terminal `FAILED` state.
- **Two-Phase Lock:** Atomically claims `PENDING` jobs via `findOneAndUpdate` setting status to `PROCESSING` with a lease timestamp to prevent dual-worker race conditions.

### 2.3 Channel Adapters & Delivery Layer
- **Email Notification Adapter (`lib/services/notifications/adapters/email.ts`):**
  - Primary active channel (`BOOKING_EMAIL_ENABLED=true`).
  - Supports modern Zoho SMTP (`smtppro.zoho.in:587`, STARTTLS) with graceful fallback to Gmail SMTP (`smtp.gmail.com:587`).
  - Standardized sender envelope: `"YatraExpertz" <noreply@yatraexpertz.com>`.
- **WhatsApp Cloud API Adapter (`lib/services/notifications/adapters/whatsapp.ts`):**
  - Dormant/prepared state (`BOOKING_WHATSAPP_ENABLED=false`).
  - Pre-registered Meta template registry with 9 canonical templates:
    1. `booking_confirmed`
    2. `booking_cancelled`
    3. `booking_modified`
    4. `payment_received`
    5. `arrival_reminder_48h`
    6. `arrival_reminder_24h`
    7. `arrival_reminder_2h`
    8. `post_stay_feedback`
    9. `review_invitation`
  - E.164 phone normalization (e.g. Indian 10-digit mobile numbers prefixed with `91`).
  - Webhook listener (`/api/webhooks/whatsapp`) with Meta `X-Hub-Signature-256` HMAC validation and `hub.challenge` handshake.

### 2.4 Document Generation & GridFS Vault (`lib/services/documents/`)
- **Engine:** PDFKit with Unicode & Indian Rupee (`₹` via DejaVu Sans) typography, responsive grid tables, QR verification tokens, and branding.
- **Storage:** MongoDB GridFS (`booking_documents.files` and `booking_documents.chunks`).
- **Documents:**
  - Booking Vouchers: Legal confirmation voucher with property rules, check-in instructions, and payment receipts.
  - Final Tax Invoices: Sequential invoice numbering (`YE-INV-YYYY-XXXX`), GST breakdown (CGST/SGST/IGST), and legal supplier information.
- **Secure Access Control:**
  - Time-bounded, cryptographically signed guest access tokens (`guestDocToken`, 72-hour TTL).
  - RBAC verification for authenticated `customer`, property `owner`, and system `admin`.

### 2.5 Stay Lifecycle & Billing Finalization (`lib/services/stay-lifecycle.ts`)
- **State Machine:** `NOT_CHECKED_IN` ➔ `CHECKED_IN` ➔ `CHECKED_OUT`.
- **Audit Logging:** Immutably records `actualCheckInAt`, `actualCheckOutAt`, `checkedInBy`, and `checkedOutBy`.
- **Scheduled vs Actual Checkout:** Scheduled dates NEVER automatically complete a stay. Actual checkout is explicitly confirmed by an authorized host or administrator.
- **Post-Stay Triggers:**
  - Checkout thank-you email sent immediately upon actual checkout.
  - Final invoice generated and delivered.
  - Unsent arrival reminders for the booking atomically cancelled.
  - Review invitation token generated with a 4-hour scheduled delay.

### 2.6 Verified Guest Reviews Engine (`lib/services/reviews/`)
- **Review Verification:** Restricted strictly to verified guests with `stayStatus === 'CHECKED_OUT'`.
- **Media Upload Pipeline:** Multi-image uploads with magic byte MIME inspection (JPEG, PNG, WebP) and 5MB per-file quotas.
- **Moderation Workflow:** Granular status transitions (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`, `HIDDEN`).
- **Social Proof:** Only `APPROVED` reviews are rendered on hotel/homestay property detail pages and the homepage social proof showcase.

### 2.7 Admin Operations Center (`app/admin/communications/`)
- **Modules:**
  1. Live Service Health & Diagnostics
  2. Queue Metrics (Pending, Sent, Failed, Processing, Today's volume)
  3. Real-time Communication Job Table (Search, Filter, Pagination)
  4. Manual Retry & Expedited Queue Trigger
  5. Safe Resend Dialog with Mandatory Audit Reason
  6. Job Cancellation & Purge Controls
  7. Channel Health & WhatsApp Preparedness Inspector
  8. Append-only Operational Audit Log
