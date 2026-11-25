# Yatra Expertz — WhatsApp Cloud API Activation Guide

## 1. Overview
This guide provides the complete, authoritative operational instructions for transitioning the Yatra Expertz WhatsApp communication channel from its current prepared/dormant state to live production.

The underlying codebase has been designed with **channel independence**:
- The Meta WhatsApp Business Cloud API adapter, template registry, webhook handler, and readiness checks are fully built.
- While unconfigured or disabled (`BOOKING_WHATSAPP_ENABLED=false`), the system safely bypasses live API calls, records jobs as blocked/skipped, prevents retry waste, and preserves full email automation.
- Activation requires configuration and Meta approval rather than code modifications.

---

## 2. Required Meta Developer Credentials
To activate live WhatsApp messaging, you must configure the following server-side environment variables in your deployment environment (e.g. Vercel Project Settings & `.env.local`):

```env
# Feature Flag (Default: false)
BOOKING_WHATSAPP_ENABLED=true

# Meta WhatsApp Business Cloud API Credentials
WHATSAPP_ACCESS_TOKEN=EAAG...                   # System User Permanent Access Token with whatsapp_business_messaging permission
WHATSAPP_PHONE_NUMBER_ID=109876543210987        # Unique ID for the registered phone number in Meta App Dashboard
WHATSAPP_BUSINESS_ACCOUNT_ID=209876543210987    # WhatsApp Business Account (WABA) ID
WHATSAPP_API_VERSION=v21.0                      # Supported Graph API version (default: v21.0)
WHATSAPP_APP_SECRET=a1b2c3d4e5f6...             # Meta App Secret (used for verifying incoming webhook signatures)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=ye_wh_verify_...  # Custom token configured in Meta App Webhook subscription
```

> [!CAUTION]
> Never use temporary 24-hour User Access Tokens generated on the Graph API Explorer in production. You must create a **Meta System User** under Business Manager with the `whatsapp_business_messaging` and `whatsapp_business_management` permissions to generate a permanent token.

---

## 3. WhatsApp Business Phone Number & Coexistence
1. **Existing Click-to-Chat Button**:
   - The website features an existing floating WhatsApp component (`WhatsAppChat.tsx`) allowing visitors to start a WhatsApp conversation.
   - If the business phone number used for click-to-chat is registered on the standard WhatsApp mobile app, Meta **does not allow** simultaneous registration on the Cloud API using the same phone number.
2. **Options for Cloud API Phone Registration**:
   - **Option A (Recommended)**: Use a dedicated virtual or business landline/mobile number for transactional notifications (e.g., `+91-XXXX-XXXXXX`).
   - **Option B (Migration)**: Delete the WhatsApp account from the mobile device to register it on the Cloud API, and use WhatsApp Business Cloud Inbox / CRM for incoming chats.

---

## 4. Template Registry & Meta Approval Requirements
Meta Cloud API strictly forbids sending free-form promotional or transactional messages outside an active 24-hour customer care window. Every outbound booking communication must use an **approved Meta Template**.

The 9 templates registered in `lib/services/notifications/adapters/whatsapp-templates.ts` must be submitted to the Meta WhatsApp Manager for approval under the **UTILITY** category:

| Notification Event | Template Name | Category | Language | Components / Parameters |
|---|---|---|---|---|
| Booking Confirmation | `booking_confirmation` | UTILITY | English (`en`) | Header (Optional Doc), Body (Guest, Property, Ref, Checkin, Checkout, Total), Button (URL) |
| 48h Reminder | `booking_reminder_48h` | UTILITY | English (`en`) | Body (Guest, Property, Checkin, Address), Button (URL) |
| 24h Reminder | `booking_reminder_24h` | UTILITY | English (`en`) | Body (Guest, Property, Checkin, Address), Button (URL) |
| 2h Reminder | `booking_reminder_2h` | UTILITY | English (`en`) | Body (Guest, Property, Address, Ref), Button (URL) |
| Booking Rescheduled | `booking_rescheduled` | UTILITY | English (`en`) | Body (Guest, Property, Ref, New Checkin, New Checkout), Button (URL) |
| Booking Cancelled | `booking_cancelled` | UTILITY | English (`en`) | Body (Guest, Property, Ref, Refund Amount), Button (URL) |
| Checkout Thank You | `checkout_thank_you` | UTILITY | English (`en`) | Body (Guest, Property, Ref), Button (URL to Review) |
| Final Invoice | `final_invoice` | UTILITY | English (`en`) | Header (Document: Invoice PDF), Body (Guest, Property, Ref, Total), Button (URL) |
| Property Review Request | `property_review_request` | UTILITY | English (`en`) | Body (Guest, Property), Button (URL) |

### Sample Template Content (Meta Submission Format)
**Template Name:** `booking_confirmation`  
**Category:** UTILITY  
**Body:**
> Hello {{1}}, your booking at {{2}} has been confirmed! 🎉  
>  
> *Booking Reference:* {{3}}  
> *Check-in:* {{4}} (From 12:00 PM)  
> *Check-out:* {{5}} (Until 11:00 AM)  
> *Total Amount:* {{6}}  
>  
> View your complete booking details and property directions below.

**Button:**
- Type: Visit Website
- Text: View Booking Details
- URL Type: Dynamic (`https://www.yatraexpertz.com/{{1}}`)

---

## 5. Webhook Configuration in Meta Dashboard
Meta delivers real-time delivery receipts (`sent`, `delivered`, `read`, `failed`) back to Yatra Expertz via the implemented webhook endpoint.

1. **Webhook URL**:
   ```
   https://www.yatraexpertz.com/api/webhooks/whatsapp
   ```
2. **Verify Token**: Enter the exact string stored in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
3. **Webhook Subscriptions**: Subscribe to the `messages` field under your WhatsApp Business Account.
4. **Signature Verification**:
   - The endpoint automatically verifies every inbound request using `X-Hub-Signature-256` HMAC-SHA256 with `WHATSAPP_APP_SECRET`.
   - Untampered receipts update the notification state from `ACCEPTED` to `DELIVERED` and record customer read receipts (`metadata.readAt`).

---

## 6. Historical Notification Protection Policy
> [!IMPORTANT]
> When `BOOKING_WHATSAPP_ENABLED` is switched to `true`, the system automatically enforces a strict historical isolation policy via `reconcileHistoricalNotificationsOnActivation()`:
> 1. **Zero Mass Replays**: Historical booking confirmations created while WhatsApp was disabled are **never** dispatched automatically.
> 2. **Expired Reminders Skipped**: Any reminder whose scheduled check-in time has passed is marked permanently as `SKIPPED`.
> 3. **Cancelled Bookings Skipped**: Reminders or confirmations for bookings that were cancelled or modified prior to activation are voided.
> 4. **Future Bookings Only**: Only newly created or eligible upcoming future notifications will be dispatched over WhatsApp.

---

## 7. Controlled Message Testing & Activation Steps
Before enabling the channel for real guests:
1. Set `BOOKING_WHATSAPP_ENABLED=true` in staging / preview.
2. In Meta App Dashboard &rarr; API Setup, send a test template message to a registered test mobile number.
3. Verify that the message arrives on your test phone with proper dynamic parameters and action buttons.
4. Verify that the webhook receives the `delivered` status update in MongoDB.
5. Once verified, enable `BOOKING_WHATSAPP_ENABLED=true` in production on Vercel.

---

## 8. Rollback & Emergency Disabling Procedure
If Meta experiences an outage, templates are flagged, or unexpected delivery behavior occurs:
1. In Vercel Project Settings &rarr; Environment Variables:
   Set `BOOKING_WHATSAPP_ENABLED=false`.
2. Redeploy the application (or promote deployment).
3. **Immediate Outcome**:
   - The notification processor immediately stops claiming or attempting WhatsApp jobs.
   - All WhatsApp jobs are gracefully recorded as `BLOCKED` with reason `WHATSAPP_CHANNEL_DISABLED`.
   - Email notifications continue delivering without interruption.
   - Zero database corruption or infinite retry loops.
