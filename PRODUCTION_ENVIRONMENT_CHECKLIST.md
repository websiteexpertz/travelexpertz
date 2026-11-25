# Yatra Expertz — Production Environment Configuration Checklist

This checklist defines every required and optional environment variable for the Yatra Expertz Booking Communication Engine. Use this guide before rolling out changes to staging or production (Vercel).

---

## 1. Environment Variables Matrix

| Variable | Required | Current Verified Setting | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Node.js runtime environment |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | MongoDB Atlas cluster connection string |
| `JWT_SECRET` | Yes | `[Configured Secret]` | Secret key used for signing session & document tokens |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://www.yatraexpertz.com` | Base public URL used for links and callback redirects |
| `SMTP_HOST` | Yes | `smtppro.zoho.in` | Active SMTP host (Zoho SMTP or `smtp.gmail.com`) |
| `SMTP_PORT` | Yes | `587` | SMTP port (587 for STARTTLS) |
| `SMTP_USER` | Yes | `noreply@yatraexpertz.com` | Authenticated mailbox address |
| `SMTP_PASSWORD` / `SMTP_PASS` | Yes | `[Configured Password]` | Zoho Application-Specific Password / Gmail App Password |
| `SMTP_SECURE` | Yes | `false` | `false` for port 587 (opportunistic TLS); `true` for 465 |
| `BOOKING_EMAIL_ENABLED` | Yes | `true` | Master feature flag enabling email notifications |
| `BOOKING_WHATSAPP_ENABLED` | Yes | `false` | Master feature flag for WhatsApp (MUST REMAIN FALSE until approved) |
| `CRON_SECRET` | Yes | `[Vercel Cron Secret]` | Secret used to authenticate `/api/cron/process-notifications` |
| `CASHFREE_APP_ID` | Yes | `[Configured Cashfree ID]` | Cashfree payment gateway client ID |
| `CASHFREE_SECRET_KEY` | Yes | `[Configured Secret Key]` | Cashfree payment gateway secret |
| `CASHFREE_ENV` | Yes | `sandbox` (Dev) / `production` | Cashfree environment selector |
| `WHATSAPP_PHONE_NUMBER_ID` | No | Optional / Prepared | Meta Cloud API Phone Number ID |
| `WHATSAPP_ACCESS_TOKEN` | No | Optional / Prepared | Meta Cloud API System User Access Token |
| `WHATSAPP_APP_SECRET` | No | Optional / Prepared | Meta App Secret for webhook HMAC validation |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN`| No | Optional / Prepared | Meta Webhook challenge verification token |

---

## 2. SMTP Verification Protocol

Before enabling production communications:
1. Verify SMTP handshake via automated CLI:
   ```bash
   node -e '
     const nodemailer = require("nodemailer");
     const transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST || "smtppro.zoho.in",
       port: Number(process.env.SMTP_PORT) || 587,
       secure: process.env.SMTP_SECURE === "true",
       auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
       },
     });
     transporter.verify().then(() => console.log("✅ SMTP Verified")).catch(console.error);
   '
   ```
2. Verify that the envelope `from` address exactly matches `process.env.SMTP_USER` (`noreply@yatraexpertz.com`) to prevent Zoho / Gmail anti-spoofing rejection (`553 Relaying disallowed`).

---

## 3. Cashfree Payment Protection Checklist

- Ensure `CASHFREE_ENV` is set to `production` ONLY in Vercel production deployment settings, and remains `sandbox` in local development (`.env.local`).
- Verify that Cashfree webhook signature verification (`x-webhook-signature`) is active on `/api/payments/cashfree/verify`.
- Confirm that payment completion calls `enqueueBookingConfirmedNotifications` idempotently.

---

## 4. Vercel Cron Job Configuration

Check that `vercel.json` contains:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-notifications",
      "schedule": "* * * * *"
    }
  ]
}
```
- In Vercel Project Settings > Cron Jobs, confirm that the cron job appears and executes once every minute.
- Set `CRON_SECRET` in Vercel Project Settings > Environment Variables.
