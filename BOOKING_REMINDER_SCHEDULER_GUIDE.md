# Yatra Expertz — Booking Reminder Scheduler Guide & Runbook

This guide documents operational procedures, scheduling configurations, and troubleshooting for the **Yatra Expertz** reminder engine.

---

## 1. System Components

| Service / File | Purpose |
|---|---|
| `lib/services/notifications/reminders.ts` | Timezone calculation, offset scheduling, rescheduling, and pre-send validation |
| `lib/services/notifications/capacity-limiter.ts` | Daily Gmail SMTP quota protection and priority message reservation |
| `lib/services/notifications/email-templates.ts` | Branded HTML & plain text reminder templates (48h, 24h, 2h) |
| `lib/services/notifications/queue.ts` | Atomic distributed queue claiming and leasing |
| `lib/services/notifications/processor.ts` | Worker batch processing loop with pre-send gates and backoff retries |
| `app/api/cron/process-notifications/route.ts` | Vercel Cron trigger endpoint |

---

## 2. Environment Variables

Configure these in your production host (e.g., Vercel Project Settings) or `.env.local`:

```env
# Booking Communication Master Toggles
BOOKING_EMAIL_ENABLED=true
BOOKING_WHATSAPP_ENABLED=false

# Delivery Mode ('live' for real dispatch, 'test' for simulation)
NOTIFICATION_DELIVERY_MODE=live

# Gmail SMTP Quota Management
SMTP_DAILY_LIMIT=450

# Scheduler Worker Security
CRON_SECRET=your_super_secret_cron_token_here

# App Canonical URL
NEXT_PUBLIC_APP_URL=https://www.yatraexpertz.com
```

---

## 3. Cron Job Configuration

The reminder queue processor should be triggered every 1 to 5 minutes by Vercel Cron or an external monitor.

### Vercel `vercel.json` Setup:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-notifications",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

### Manual Trigger / Health Verification:
```bash
curl -X POST https://www.yatraexpertz.com/api/cron/process-notifications \
  -H "Authorization: Bearer <CRON_SECRET>" \
  -H "Content-Type: application/json"
```

Expected Response:
```json
{
  "success": true,
  "claimed": 3,
  "processed": 3,
  "succeeded": 3,
  "failed": 0,
  "blocked": 0,
  "skipped": 0,
  "durationMs": 412
}
```

---

## 4. Property Check-In / Check-Out Configuration

Check-in times are retrieved dynamically from property records (`hotels` or `homestays` collection in MongoDB):

```json
{
  "name": "Grand Himalayan Retreat",
  "checkInTime": "2:00 PM",
  "checkOutTime": "11:00 AM",
  "phone": "+91 98765 43210",
  "directionsUrl": "https://maps.google.com/?q=..."
}
```

If a property has no configured `checkInTime`, the scheduler automatically applies the standard business default of **12:00 PM (IST)**.

---

## 5. Rescheduling and Cancellation Operations

### Customer Rescheduled Stay
When a customer updates their stay dates in `PATCH /api/bookings`:
1. The route increments `bookingVersion` by 1.
2. `rescheduleRemindersForBooking` marks previous pending reminder jobs as `CANCELLED` (`BOOKING_RESCHEDULED`).
3. New reminder offsets are calculated based on the updated check-in date/time.

### Customer Cancelled Stay
When a booking is cancelled in `DELETE /api/bookings` or `PATCH /api/bookings`:
1. `cancelRemindersForBooking` immediately transitions all pending or retry-scheduled reminders to `CANCELLED`.
2. Even if a worker already claimed a reminder prior to cancellation, the **Pre-Send Validation Gate** rechecks the database right before dispatch and aborts transmission.

---

## 6. Troubleshooting Common Issues

### Issue: "Reminder was marked SKIPPED"
- **Reason 1**: Check the `lastErrorCode`. If `REMINDER_TIME_ELAPSED`, the guest made a last-minute booking inside the reminder window.
- **Reason 2**: If `REMINDER_DELIVERY_WINDOW_EXPIRED`, the worker was delayed and the 15-minute post-check-in grace period expired.
- **Reason 3**: If `GUEST_ALREADY_CHECKED_IN`, the front desk checked the guest in before the reminder fired.

### Issue: "Daily SMTP capacity threshold reached"
- Gmail SMTP daily limit of 450 emails is nearing exhaustion.
- Non-critical reminders are paused automatically to protect instant booking confirmations.
- Reminders will resume automatically when the daily count resets at 00:00 UTC.
