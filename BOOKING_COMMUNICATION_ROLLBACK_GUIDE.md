# Yatra Expertz — Booking Communication Engine: Rollback & Incident Response Guide

This guide describes emergency procedures, kill-switches, and recovery mechanisms for the Yatra Expertz Booking Communication Engine.

---

## 1. Emergency Kill Switches (Zero Downtime)

### 1.1 Master Communication Channels Kill-Switch
If anomalous emails or loops occur, communications can be stopped instantly without redeploying code:

1. **Disable Email Delivery via Vercel Environment:**
   - In Vercel Project Settings > Environment Variables:
     - Set `BOOKING_EMAIL_ENABLED` = `false`
   - Trigger a redeployment or restart existing lambdas.
   - *Impact:* The notification queue processor will gracefully skip email dispatch. All pending jobs will remain safely queued in MongoDB with status `PENDING` without being dropped or lost.

2. **Disable WhatsApp Delivery (If active):**
   - Ensure `BOOKING_WHATSAPP_ENABLED` = `false`.

### 1.2 Pause Cron Worker Execution
If the background queue worker needs to be paused immediately:
- Temporarily change `CRON_SECRET` in Vercel Environment Variables.
- Incoming Vercel cron triggers will receive `401 Unauthorized` and will not process jobs until the secret is restored.

---

## 2. Administrative Incident Mitigation (Admin UI)

Authorized administrators can mitigate queue issues directly in `/admin/communications`:

### 2.1 Cancelling Problematic Jobs
1. Navigate to `https://www.yatraexpertz.com/admin/communications`.
2. Locate the problematic notification job in the live table.
3. Click **Cancel Job**.
4. The system transitions the job to `CANCELLED`, preventing worker selection and delivery.

### 2.2 Purging or Isolating Poison-Pill Jobs
If a corrupted booking payload causes repeated worker exceptions:
1. The capacity limiter will automatically record the error and increment the retry counter.
2. Upon reaching `retryCount: 3`, the engine automatically moves the job to terminal `FAILED` status, isolating it from worker polling.
3. Administrators can review the error trace in the job details modal and resolve the underlying data issue before attempting a manual retry.

---

## 3. Code Rollback Procedure

If a breaking regression requires an immediate software rollback:

1. **Vercel Instant Rollback:**
   - Go to Vercel Dashboard > `yatraexpertz` > **Deployments**.
   - Locate the previous stable production deployment.
   - Click **Instant Rollback**.
   - Traffic switches instantly to the previous build within 5 seconds.

2. **Database Backward Compatibility:**
   - The MongoDB schema (`booking_notifications`, `booking_documents`, `booking_reviews`) is additive and backward compatible.
   - Existing documents created by Phase 8 do not break previous phase code.
   - All status enums are backward-compatible.

---

## 4. Contact & Escalation Protocol

| Role | Contact Channel | Responsibility |
| :--- | :--- | :--- |
| **Lead Developer** | Deepansh Tyagi | Code investigation, Git rollback, hotfix patches |
| **DevOps / Hosting** | Experzt Technology | Vercel configuration, DNS, and SSL |
| **Mail Administration** | Zoho Mail Admin Console | SMTP account status, rate limits, bounce monitoring |
| **Payment Gateway** | Cashfree Merchant Support | Payment status verification and webhook integrity |
