# Yatra Expertz — Admin Communication Management & Monitoring Architecture

**Document Version:** 1.0  
**Phase:** Phase 7 (Admin Communication Management, Monitoring & Operational Controls)  
**System:** Yatra Expertz ([https://www.yatraexpertz.com/](https://www.yatraexpertz.com/))  
**Target Architecture:** Distributed Asynchronous Queue with Administrative Oversight, Failure Recovery & Append-Only Audit Logging  

---

## 1. Executive Summary

Phase 7 establishes complete operational visibility, administrative controls, failure triage, and audit integrity across the entire Yatra Expertz booking communication ecosystem. It unifies email notifications (Google Workspace / Gmail SMTP), dormant WhatsApp messaging infrastructure (Meta Business Cloud API ready), automated arrival reminder schedules, checkout notifications, invoice transmissions, and verified review invitations into a centralized Administrative Communication Center.

All administrative controls are strictly governed by role-based access control (RBAC), atomic database operations, recipient privacy masking, and immutable append-only audit logs.

---

## 2. Core Architectural Pillars

### 2.1 Centralized Operations Center (`/admin/communications`)
The Operations Center provides real-time visibility into the notification queue and dispatcher health through eight dedicated functional modules:
1. **Overview Dashboard:** Live KPI cards for dispatches, deliveries, permanent failures, retrying jobs, upcoming arrival reminders, Gmail SMTP quota utilization, and dormant WhatsApp status.
2. **Notification Inventory:** Full-text searchable and filterable ledger across channel (`EMAIL`, `WHATSAPP`), status (`PENDING`, `ACCEPTED`, `PROCESSING`, `DELIVERED`, `FAILED`, `CANCELLED`, `SKIPPED`, `DELIVERY_UNKNOWN`), and event type (`BOOKING_CONFIRMATION`, `REMINDER_48_HOURS`, `REMINDER_24_HOURS`, `REMINDER_2_HOURS`, `CHECKOUT_THANK_YOU`, `FINAL_INVOICE`, `REVIEW_REQUEST`).
3. **Scheduled Reminders:** Triage view of pending arrival reminders with execution countdown and verified cancellation workflows.
4. **Failed & Retrying Dispatches:** Diagnostic view displaying failure error codes, socket errors, retry attempts, and authorized retry actions.
5. **SMTP Capacity Monitoring:** Real-time tracking of Gmail SMTP's 450 daily email ceiling, 50-email priority reservation margin, and hourly throughput metrics.
6. **WhatsApp Cloud API Readiness:** Non-sensitive operational checklist displaying Meta Business Phone ID, verification state, and 7 approved message templates while strictly blocking live dispatch via `BOOKING_WHATSAPP_ENABLED=false`.
7. **Scheduler & Worker Health:** Real-time heartbeat diagnostics measuring worker execution frequency, run durations, overdue jobs (>10m), and stale worker leases (>5m).
8. **Append-Only Audit Trail:** Tamper-evident ledger recording every administrative intervention with actor identity, timestamp, action type, booking reference, and mandatory justification.

---

## 3. Data Model & Collection Specifications

### 3.1 `booking_notifications`
Primary durable collection storing state for all transactional and scheduled communications:
- `bookingId`: ObjectId / String reference to booking record.
- `channel`: Enum (`"EMAIL"` | `"WHATSAPP"`).
- `type`: Notification type enum.
- `recipient`: Raw recipient address (masked upon retrieval in administrative surfaces).
- `status`: State enum (`"PENDING"` | `"PROCESSING"` | `"ACCEPTED"` | `"DELIVERED"` | `"FAILED"` | `"CANCELLED"` | `"SKIPPED"` | `"DELIVERY_UNKNOWN"`).
- `scheduledAt`: Date timestamp for planned execution.
- `nextAttemptAt`: Date timestamp for retry scheduling.
- `attempts`: Integer tracking current attempt count.
- `maxAttempts`: Integer cap on automated retry attempts (default: 3).
- `idempotencyKey`: Unique string preventing duplicate dispatches.
- `claimToken`: Unique UUID assigned during worker batch acquisition.
- `leaseExpiresAt`: Date timestamp enforcing 5-minute worker lease lock.
- `lastErrorCode`: Machine-readable error code.
- `lastErrorMessage`: Sanitized human-readable error summary.
- `metadata`: Flexible context map (booking reference, guest name, property name).
- `createdAt` / `updatedAt`: ISO Date timestamps.

### 3.2 `communication_audit_logs`
Immutable append-only ledger storing all administrative operations:
- `_id`: Unique ObjectId.
- `adminUsername`: Authenticated administrator display name.
- `adminId`: Administrator account ID or email.
- `actionType`: Operation enum (`"RETRY_NOTIFICATION"` | `"RESEND_NOTIFICATION"` | `"CANCEL_NOTIFICATION"` | `"TRIGGER_WORKER"`).
- `notificationId`: Targeted notification document ID.
- `idempotencyKey`: Communication idempotency key.
- `bookingId`: Associated booking ID.
- `channel`: Notification channel.
- `type`: Communication event type.
- `previousState`: Notification status before intervention.
- `resultingState`: Resulting notification status after intervention.
- `reason`: Mandatory text justification provided by administrator (min 5 chars).
- `outcome`: Result enum (`"SUCCESS"` | `"REJECTED"` | `"ERROR"`).
- `correlationId`: Unique tracking string linking request to worker logs.
- `timestamp`: UTC Date of record creation.

### 3.3 `notification_worker_runs`
Diagnostic heartbeat collection tracking background processor executions:
- `workerId`: Identifier of executing cron worker or manual trigger.
- `stats`: Object containing `claimed`, `processed`, `accepted`, `delivered`, `retried`, `failed`, `durationMs`.
- `timestamp`: UTC Date of worker completion.

---

## 4. Administrative Operational Workflows

### 4.1 Authorized Notification Retry (`POST /api/admin/communications/[id]/retry`)
Enables administrators to re-queue eligible failed notifications for immediate delivery:
1. **Authentication & RBAC:** Verifies valid administrator session; rejects customer and owner roles with `401`/`403`.
2. **Eligibility Validation:**
   - Permitted states: `FAILED`, `DELIVERY_UNKNOWN`, `RETRY_SCHEDULED`.
   - Rejects notifications in `PENDING`, `PROCESSING`, `ACCEPTED`, `DELIVERED`, or `SKIPPED` states.
   - Enforces permanent failure protection: blocks retry if `lastErrorCode === "INVALID_EMAIL_RECIPIENT"`.
   - Requires explicit override (`forceDuplicateDecision: true`) for `DELIVERY_UNKNOWN` states.
3. **Booking Verification:** Verifies associated booking is confirmed; blocks retries for cancelled bookings.
4. **State Transition:** Atomically updates notification to `status: "PENDING"`, resets lease tokens, and sets `nextAttemptAt: new Date()`.
5. **Audit Record:** Writes immutable log with administrative reason.

### 4.2 Authorized Manual Resend (`POST /api/admin/communications/[id]/resend`)
Enables manual resending of critical communications (e.g., vouchers, invoices, review links) without corrupting historical records:
1. **Preservation of History:** Original notification record remains unaltered.
2. **Distinct Resend Key:** Generates a new notification document with `idempotencyKey: "RESEND:<bookingId>:<type>:<timestamp>:<channel>"`.
3. **Lifecycle Validation:**
   - **Vouchers / Arrival Reminders:** Verifies arrival reminder window has not expired (>15 mins past check-in).
   - **Final Invoice:** Reuses existing invoice number (`finalInvoiceNumber`) and legal document without re-numbering.
   - **Review Requests:** Verifies guest has completed stay and has not already submitted a verified review.
4. **Immediate Scheduling:** Inserts new job with `status: "PENDING"` and records full audit log.

### 4.3 Scheduled Reminder Cancellation (`POST /api/admin/communications/[id]/cancel`)
Allows administrators to cancel upcoming automated arrival reminders upon guest request:
1. **Status Check:** Permitted only for `PENDING` or `RETRY_SCHEDULED` reminders.
2. **State Transition:** Atomically transitions status to `CANCELLED` and records administrator reason in `lastErrorMessage`.
3. **Audit Log:** Permanent record logged with cancellation reason.

---

## 5. Security & Privacy Safeguards

1. **PII Masking:**
   - Email addresses are masked in all administrative lists and logs: `d***k@gmail.com`.
   - Phone numbers are masked: `+91 98*** **210`.
   - Full unmasked details are restricted to authorized server-side dispatch execution.
2. **Zero Secret Exposure:**
   - No SMTP passwords, Cashfree secret keys, or Meta WhatsApp tokens are returned in any API responses.
   - Configuration endpoints only return boolean presence flags and template status.
3. **Safe Email Previews:**
   - Rendered previews in the admin console use strict HTML entity sanitization and scoped iframe/container rendering to prevent admin session cross-site scripting (XSS).
4. **Scoped Document Tokens:**
   - Guest invoice and voucher downloads utilize HMAC-signed, expiring, scoped tokens preventing unauthorized file enumeration.

---

## 6. Full Regression Matrix

| Phase | Functional Scope | Test Count | Status |
|:---|:---|:---:|:---:|
| **Phase 2** | Data Layer, Notification Models & Queue Engine | 20 / 20 | **PASSED** |
| **Phase 2.1** | WhatsApp Readiness & Automated Email Integration | 20 / 20 | **PASSED** |
| **Phase 3** | Automated Booking Reminders & Scheduling Engine | 28 / 28 | **PASSED** |
| **Phase 4** | PDF Generation & Secure Document Storage Engine | 32 / 32 | **PASSED** |
| **Phase 5** | Actual Checkout, Billing Finalization & Post-Stay | 40 / 40 | **PASSED** |
| **Phase 6** | Verified Guest Reviews & Media Upload Engine | 40 / 40 | **PASSED** |
| **Phase 7** | Admin Communication Management & Monitoring | 40 / 40 | **PASSED** |
| **TOTAL** | **Multi-Phase Complete Architecture Regression** | **220 / 220** | **100% PASSED** |
