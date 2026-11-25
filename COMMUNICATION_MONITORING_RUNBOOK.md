# Yatra Expertz — Communication Operations & Monitoring Runbook

**Document Version:** 1.0  
**Phase:** Phase 7 (Admin Communication Management & Operational Controls)  
**System:** Yatra Expertz ([https://www.yatraexpertz.com/](https://www.yatraexpertz.com/))  
**Audience:** Site Reliability Engineers, Support Leads & Operational Administrators  

---

## 1. Daily Operations & Routine Monitoring

### 1.1 Accessing the Operations Center
- **URL:** `https://www.yatraexpertz.com/admin/communications`
- **Required Role:** `admin`
- **Quick Links:** Navigation sidebar item **"Communications"** or direct link from booking details in `/admin/bookings`.

### 1.2 Morning Health Checklist
Every morning (08:00 IST), the on-duty administrator should review:
1. **Scheduler Status:** Verify status is **"Healthy"** (green indicator). If "Delayed" or "Degraded", see Section 3.1.
2. **SMTP Budget:** Check "Remaining Budget". If remaining quota is < 100 emails before noon, investigate unexpected volume.
3. **Failed Notifications Tab:** Verify there are no unresolved critical failures for booking confirmations or final invoices.
4. **WhatsApp Status:** Verify channel remains **"DORMANT / DISABLED"** with 0 dispatches.

---

## 2. Standard Operating Procedures (SOPs)

### SOP-01: Triage and Retry of Failed Deliveries
**Scenario:** A booking confirmation or final invoice email has failed due to a transient network timeout or SMTP socket error.
1. Navigate to `/admin/communications` and select the **"⚠️ Failed & Retries"** tab.
2. Click **"Details"** on the failed record to inspect the `lastErrorMessage` and `lastErrorCode`.
3. If error is transient (e.g., `ETIMEDOUT`, `ECONNRESET`, `SMTP_SOCKET_CLOSED`):
   - Click the **"Retry"** button.
   - Enter an administrative reason (e.g., `"Transient socket error resolved; customer requested voucher"`).
   - Check **"Reset attempt count back to 0"** if automated retries were exhausted.
   - Click **"Confirm Retry"**.
4. The notification is immediately queued in `PENDING` state and picked up by the next worker run.

### SOP-02: Handling Permanent Recipient Failures
**Scenario:** Notification failed with error `INVALID_EMAIL_RECIPIENT` (550 Mailbox not found).
1. Do **NOT** retry the failed notification (the system automatically protects against this).
2. Contact the guest via phone or update the email address on the booking record via `/admin/bookings`.
3. Once the contact information is updated, execute an **Authorized Manual Resend** (SOP-03).

### SOP-03: Executing an Authorized Manual Resend
**Scenario:** A guest requests a duplicate booking confirmation voucher or final invoice.
1. Open the booking details in `/admin/bookings` or locate the record in `/admin/communications`.
2. Click **"Resend"**.
3. In the resend modal:
   - Provide a mandatory reason (e.g., `"Guest requested copy of GST invoice for expense filing"`).
   - Click **"Execute Resend"**.
4. The system validates that:
   - For vouchers/arrival reminders: the check-in window has not expired.
   - For invoices: the existing invoice number and document are preserved without regenerating billing.
   - For reviews: the stay is completed and no review exists.
5. A new job is dispatched with a `RESEND:` idempotency prefix.

### SOP-04: Cancelling Scheduled Arrival Reminders
**Scenario:** A guest reschedules or requests no promotional/reminder messages before arrival.
1. In `/admin/communications`, navigate to **"⏰ Scheduled Reminders"**.
2. Locate the upcoming reminder (48h, 24h, or 2h).
3. Click **"Cancel"**.
4. Enter mandatory cancellation reason.
5. Click **"Cancel Reminder"**.
6. The status is permanently set to `CANCELLED` and recorded in the audit trail.

### SOP-05: Manual Notification Worker Execution
**Scenario:** Scheduled worker cron was delayed or urgent notifications require immediate processing.
1. In the top right corner of `/admin/communications`, click **"⚡ Run Worker"**.
2. The system executes `POST /api/admin/communications/worker`.
3. A confirmation banner displays execution duration and processed job count.

---

## 3. Incident Management & Troubleshooting

### 3.1 Scheduler Health State: "Delayed" or "Degraded"
- **Condition:** No worker heartbeat received in >15 minutes, or overdue jobs count > 0.
- **Root Cause Analysis:**
  1. Check Vercel Cron invocation logs under `https://vercel.com/` for `/api/cron/process-notifications`.
  2. Verify environment variable `CRON_SECRET` matches Vercel Cron configuration.
  3. Check MongoDB connectivity or lock contention in `notification_worker_runs`.
- **Immediate Mitigation:**
  - Trigger a manual worker run from `/admin/communications` using **"⚡ Run Worker"**.
  - If jobs remain locked, the system automatically frees stale leases after 5 minutes.

### 3.2 Gmail SMTP Daily Quota Depletion (< 50 Emails Remaining)
- **Condition:** `remainingBudget < 50` before end of day.
- **Automated Protection:**
  - The queue engine automatically **pauses arrival reminders and review invitations**.
  - Remaining 50 emails are strictly reserved for transactional booking confirmations and cancellations.
- **Mitigation:**
  - Standard marketing reminders will resume automatically at 00:00 UTC (05:30 IST) when the daily quota resets.
  - If high-volume corporate bookings are scheduled, adjust `SMTP_DAILY_LIMIT` in environment variables or request Google Workspace account sending limit increase.

### 3.3 Accidental WhatsApp Activation Protection
- **Condition:** WhatsApp messages attempting live dispatch.
- **Verification:**
  - Confirm `BOOKING_WHATSAPP_ENABLED` is set to `false` in production environment.
  - The adapter returns status `BLOCKED` with code `WHATSAPP_CHANNEL_DISABLED`.
  - Zero messages will reach Meta Cloud API.

---

## 4. Audit Trail & Compliance Inquiries

Whenever audit records are requested for financial or regulatory compliance:
1. Navigate to `/admin/communications` -> **"🛡️ Audit Trail"**.
2. Filter or query `communication_audit_logs` collection by `bookingReference` or `bookingId`.
3. Audit records are append-only and cannot be edited or deleted via the UI or API.
