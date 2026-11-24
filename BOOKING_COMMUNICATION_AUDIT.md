# Yatra Expertz — Booking Communication System Audit
**Document Version:** 1.0.0  
**Status:** Completed & Validated  
**Scope:** Phase 1 Architectural Audit (Read-Only)

---

## 1. System Overview & Technology Stack

- **Application Name:** Yatra Expertz (formerly TravelExpertz)
- **Framework:** Next.js 14+ (App Router architecture with TypeScript)
- **Database:** MongoDB Atlas (Native `mongodb` Node.js driver v6.14.2)
- **Asset Storage:** MongoDB GridFS (`GridFSBucket`)
- **Hosting / Runtime:** Vercel Serverless Functions
- **Styling:** Tailwind CSS
- **Current Communication Libraries:** Nodemailer v6.10.0 (SMTP), Static WhatsApp Click-to-Chat

---

## 2. Comprehensive Booking Lifecycle Audit

### 2.1 Booking Creation & Lifecycle Endpoints
- **Primary Endpoint:** [app/api/bookings/route.ts](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/api/bookings/route.ts)
  - `GET /api/bookings`: Retrieves bookings filtered by `id`, `userId`, `homestayId`, or `bookingStatus`.
  - `POST /api/bookings`: Validates payload, checks room availability, handles price breakdown (base price, taxes, platform fee, commission), creates booking record.
  - `PATCH /api/bookings`: Supports updates to `bookingStatus` or `paymentStatus`.
  - `DELETE /api/bookings`: Handles booking cancellation and restores room inventory.

### 2.2 Payment Verification Endpoint
- **Payment Verification Endpoint:** [app/api/payments/cashfree/verify/route.ts](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/api/payments/cashfree/verify/route.ts)
  - Interacts with Cashfree PG API (`https://api.cashfree.com/pg` or sandbox) using version `2023-08-01`.
  - Verifies order status `order.order_status === "PAID"`.
  - Fetches payment details (`/orders/{order_id}/payments`) to capture `cf_payment_id` and `payment_group`.

### 2.3 Authoritative Confirmation Triggers
The codebase contains **two distinct paths** that result in a confirmed booking:

1. **Direct / Pay-at-Property / Offline Booking Path:**
   - **Trigger:** Handled in `POST /api/bookings` when `!body.paymentInitiated && body.userId`.
   - **Database State:** `bookingStatus` is initialized immediately as `"confirmed"`.
   - **Current Communication Behavior:** Lines 220–257 send a notification email **only to the property owner**, alerting them of a new booking. **No confirmation email is sent to the customer**, and no WhatsApp message is dispatched.
   
2. **Online Payment (Cashfree) Booking Path:**
   - **Step 1:** In `POST /api/bookings`, when `body.paymentInitiated === true`, booking is created with `bookingStatus: "pending"` and `paymentStatus: "pending"`.
   - **Step 2:** Cashfree payment is completed by the customer on the checkout screen.
   - **Authoritative Trigger:** In `POST /api/payments/cashfree/verify`, the backend validates Cashfree's authoritative order status (`order.order_status === "PAID"`).
   - **Database State Transition:** Atomically updates:
     ```typescript
     {
       paymentStatus: "paid",
       bookingStatus: "confirmed",
       paymentGateway: "cashfree",
       paymentId: successfulPayment?.cf_payment_id || booking.cashfreeOrderId,
       paymentMethod: successfulPayment?.payment_group || "cashfree",
       paidAt: new Date(),
       updatedAt: new Date()
     }
     ```
   - **Current Communication Behavior:** **Zero emails or WhatsApp messages are triggered.** The customer is redirected to the frontend confirmation page with no automated receipt or voucher delivered to their inbox.

### 2.4 Actual Database Models & Status Definitions
Inspected across `bookings`, `hotels`, and `homestays` collections:
- **`bookingStatus` Values:**
  - `"pending"`: Initial state for online payment bookings awaiting Cashfree settlement.
  - `"confirmed"`: Authoritatively confirmed (paid or direct booking confirmed).
  - `"cancelled"`: Cancelled via `DELETE /api/bookings` or admin dashboard.
  - *(Note: Admin UI displays a `"completed"` filter tab, but no automated lifecycle transition currently marks bookings as `"completed"`).*
- **`paymentStatus` Values:**
  - `"pending"`: Awaiting gateway response.
  - `"paid"`: Confirmed by Cashfree or marked by admin.
  - `"failed"`: Payment rejected or abandoned.
  - `"refunded"`: Processed upon cancellation.
- **Customer / Guest Data Stored:**
  - `guestName`: Full name of guest.
  - `guestEmail`: Customer email address.
  - `guestPhone`: Customer contact number.
  - `checkin` / `checkout`: String/Date formatted stay interval.
  - `guests`: Object containing `{ adults, children }`.
  - `bookingReference`: Unique identifier generated as `YE-XXXXXX` or `TE-XXXXXX`.
  - `price`: Total monetary amount.
  - `priceBreakdown`: Detailed base price, GST/taxes, platform fees, and owner payout.

### 2.5 Hotel vs. Homestay Booking Differences
- **Hotel Bookings:** Reference `hotelId` (ObjectId) and `roomId` (String). Inventory decrement targets `hotels.rooms.$.availability`.
- **Homestay Bookings:** Reference `homestayId` (ObjectId) and `roomId` (String). Inventory decrement targets `homestays.rooms.$.availability`.
- **Unified Schema:** Both property types converge on the single `bookings` collection with uniform price calculation and guest schema.

### 2.6 Booking Cancellation Logic
- Handled in `DELETE /api/bookings`:
  - Validates booking existence.
  - Sets `bookingStatus: "cancelled"` and `updatedAt: new Date()`.
  - Increments room availability by +1 back to the property inventory.
  - **Limitation:** Does not emit cancellation notifications to customer or owner, nor does it cancel pending scheduled reminders.

### 2.7 Admin & Owner Booking Management
- **Admin UI:** [app/admin/bookings/page.tsx](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/admin/bookings/page.tsx)
- **Owner UI:** [app/owner/bookings/page.tsx](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/owner/bookings/page.tsx)
- Supports status filtering, viewing customer details, and manual cancellation.
- **Critical Finding:** Neither dashboard possesses an operational "Check In" or "Check Out" action or timestamp recorder.

---

## 3. Email Integration Audit

### 3.1 Existing Infrastructure
- **Service File:** [lib/services/email.ts](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/lib/services/email.ts)
- **Engine:** Nodemailer v6.10.0 using SMTP transport.
- **Default Host:** `smtp.gmail.com` on port `587`.
- **Environment Variables Used:**
  - `SMTP_HOST`: Host address (defaults to `smtp.gmail.com`).
  - `SMTP_PORT`: Port (defaults to `587`).
  - `SMTP_USER`: SMTP username / Gmail account.
  - `SMTP_PASSWORD`: SMTP App Password / credential.
- **Sender Address:** `"YatraExpertz" <${process.env.SMTP_USER}>`

### 3.2 Capabilities & Limitations
- **HTML Email Support:** Fully supported (`options.html` is passed directly to Nodemailer).
- **PDF Attachment Support:** Nodemailer natively accepts `attachments: [{ filename, content, contentType }]`. However, the current `sendEmail` interface does not expose the `attachments` array.
- **Queueing & Retries:** None. Calls to `transporter.sendMail` are invoked directly in request threads without retry logic, persistence, or rate limiting.
- **Delivery Receipts:** No webhook handlers or bounce/delivery tracking configured.

---

## 4. WhatsApp Integration Audit

### 4.1 Existing Infrastructure
- **Component File:** [app/components/WhatsAppChat.tsx](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/components/WhatsAppChat.tsx)
- **Type:** Frontend Client-Side Click-to-Chat widget.
- **Link Format:** `https://wa.me/918923992522?text=Hello%20YatraExpertz%2C%20I%20need%20assistance`
- **Phone Number:** `+91 8923992522`

### 4.2 Verified Limitation & Architecture Corrections
- **Existing Click-to-Chat Widget:** [app/components/WhatsAppChat.tsx](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/components/WhatsAppChat.tsx) provides a direct `wa.me` assistance button. **This component must be preserved strictly unchanged.**
- **Automated Outbound Messaging:** **NOT IMPLEMENTED IN CURRENT CODEBASE.**
- The existing codebase contains **no Meta WhatsApp Business Cloud API**, no third-party BSP SDK, no webhook handlers, no template registration, and no automated messaging backend functions.
- **Mandatory Meta API Version Correction:** Do NOT use expired Graph API v19.0. Use a configurable, currently supported Meta Graph API version verified against official Meta documentation (`process.env.WHATSAPP_API_VERSION || 'v21.0'`).
- **Phone Number Verification:** Do NOT assume the existing WhatsApp business number (`+91 8923992522`) is immediately eligible for Cloud API registration or coexistence without explicit verification. If already registered on the mobile WhatsApp Business app, it requires certificate deregistration or a dedicated Cloud API WABA phone number ID.

---

## 5. Checkout Management Audit

- **Current State:** No operational checkout workflow exists in the application.
- The `checkin` and `checkout` fields store calendar dates selected during booking.
- Guests do not have a self-checkout button, and hotel/homestay owners have no "Mark Checked Out" button in `app/owner/bookings/page.tsx`.
- **Mandatory Checkout Correction:** **Actual guest checkout must NEVER be automatically confirmed by a timer or background scheduler.** Checkout must be explicitly confirmed by authorized property staff or an admin to prevent fraudulent billing and incorrect stay status.
- Schedulers may dispatch reminders to property staff to confirm guest checkout, but must never falsely mark a booking as completed. Final tax invoices require finalized billing information before generation.

---

## 6. Invoice and Booking Voucher Audit

- **Current State:** No PDF generation library exists in `package.json`.
- There are no existing PDF templates, generators, or rendering utilities in the project.
- Booking confirmation vouchers and final GST tax invoices must be generated using a lightweight, serverless-compatible PDF generator (e.g., `pdfkit` or `@react-pdf/renderer`) without heavy headless browsers (Puppeteer) which exceed Vercel serverless package limits.

---

## 7. Property Review System Audit

- **Endpoint:** [app/api/reviews/route.ts](file:///Users/deepanshtyagi/Documents/Experzt%20Technology%20office%20work/travelexpertz/app/api/reviews/route.ts)
- **Model:**
  - `propertyId`, `propertyName`, `propertyType`, `userId`, `userName`, `userImage`.
  - `rating`: Star rating (1–5).
  - `reviewText`: Written comment.
  - `reviewImages`: Array of photo URLs.
  - `media`: Array of `{ type: "photo" | "video", url, thumbnailUrl }`.
  - `verified`: Boolean flag.
  - `active`: Boolean flag (requires admin approval before public listing).
- **Limitation:** Review submissions are currently not tied to a specific `bookingId` or validated against confirmed completed stays. Connecting reviews to `bookingId` will ensure verified guest reviews.

---

## 8. Summary of Findings & Readiness Matrix

| Feature / Subsystem | Current State in Codebase | Readiness for Automation | Phase 1 Recommendation |
| :--- | :--- | :--- | :--- |
| **Booking Lifecycle** | Solid, dual-path (`bookings`, Cashfree verify) | Ready with unified trigger hook | Hook both Cashfree verify & direct booking |
| **Email Delivery** | Nodemailer SMTP configured & working | Ready for templates & attachments | Enhance `lib/services/email.ts` to accept attachments |
| **WhatsApp Delivery** | Static `wa.me` click-to-chat only | Requires Cloud API Integration | Build Meta WhatsApp Cloud API client in Phase 5 |
| **Job Queueing** | In-memory / immediate (no queue) | Requires persistent MongoDB collection | Implement `booking_notifications` collection |
| **Voucher / Invoices** | None (No PDF libraries) | Requires PDF engine | Install lightweight serverless PDF library |
| **Reminders** | None | Requires cron scheduler | Implement protected runner API; document Vercel Hobby (daily only) vs Pro / external ping (1 min) |
| **Checkout Flow** | Date-based only (No operational button) | Requires staff/admin action | Manual "Confirm Check-Out" in Owner/Admin UI; staff reminder |
| **Reviews** | Implemented with admin moderation | Needs `bookingId` linkage | Generate secure tokenized review links |
