# Yatra Expertz — Secure Document Storage & Access Control Guide

## 1. Storage Architecture Overview

All customer booking vouchers, receipts, and invoices are stored as encrypted-at-rest binary streams in an isolated MongoDB GridFS bucket named **`booking_documents`**.

```
Public Uploads (Images, Avatars, Reviews):
  └── Bucket: `uploads` (`/api/files/[id]`) ──► Open read access

Private Legal & Financial Documents:
  └── Bucket: `booking_documents` (`/api/bookings/[id]/documents/[documentId]`) ──► Strict RBAC + Signed Tokens
```

### 1.1 GridFS Isolation
- Public image uploads use the `uploads` bucket, accessible via `/api/files/[id]`.
- Financial and customer documents reside exclusively in `booking_documents`.
- The public file endpoint `/api/files/[id]` cannot access files in `booking_documents`.

---

## 2. Document Integrity & Verification

Every stored document computes:
1. **Byte Length**: Stored in `fileSize` and verified on retrieval.
2. **SHA-256 Checksum**: Computed over the raw binary buffer at generation time and stored in `checksum`.
3. **MIME Type**: Strictly `application/pdf`.

```typescript
export function computeBufferChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}
```

---

## 3. Multi-Tiered Access Authorization

All document streaming is gated behind `authorizeDocumentAccess`:

```mermaid
flowchart TD
    Req[GET /api/bookings/[id]/documents/[documentId]] --> AuthCheck{Check Authentication}
    AuthCheck -->|Admin User| Allow[200 OK Stream PDF]
    AuthCheck -->|Customer Match| Allow
    AuthCheck -->|Property Owner Match| Allow
    AuthCheck -->|Guest Token Present| TokenCheck{Verify HMAC Token}
    TokenCheck -->|Valid & Unexpired| Allow
    TokenCheck -->|Invalid or Expired| Deny403[403 Forbidden]
    AuthCheck -->|Unauthenticated / Stranger| Deny401[401 Unauthorized / 403 Forbidden]
```

### 3.1 Authorization Roles
1. **Platform Administrator (`role: "admin"`)**: Unrestricted download access for customer support and dispute audits.
2. **Customer Owner (`booking.userId === user.id`)**: Direct authenticated access to the customer's own documents.
3. **Property Host / Owner (`property.ownerId === user.id`)**: Allows hotel/homestay managers to verify check-in vouchers.
4. **Guest Token (`?token=...`)**: Cryptographically signed HMAC-SHA256 URL token for direct email downloads without requiring account login.

---

## 4. Cryptographic Guest Access Tokens

When sending confirmation vouchers via email or SMS, guests may not have an active session cookie. A secure, time-limited token is generated:

```typescript
export function generateGuestDocumentToken(
  bookingId: string,
  guestEmail: string,
  validityDays: number = 30
): string {
  const expiresAt = Date.now() + validityDays * 24 * 60 * 60 * 1000;
  const payload = { bookingId, guestEmail, expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET)
    .update(payloadB64)
    .digest("hex");
  return `${payloadB64}.${signature}`;
}
```

### 4.1 Security Properties
- **Cryptographic Tamper-Proofing**: The HMAC signature prevents tampering with `bookingId` or `expiresAt`.
- **Bounded Expiration**: Automatically rejects expired links (`validityDays` default: 30 days).
- **ID Binding**: Tokens cannot be repurposed across different booking IDs.

---

## 5. Streaming Endpoint Specification

### `GET /api/bookings/[id]/documents/[documentId]`

#### Query Parameters
- `token` *(optional)*: Signed guest access token (if unauthenticated).

#### Response Headers
To prevent browser or proxy caching of private guest identification and financial details, the endpoint strictly sets non-cacheable headers:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="Yatra-Expertz-Booking-Voucher-YE-BV-2026-000001.pdf"
Content-Length: 4292
Cache-Control: private, no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
X-Content-Type-Options: nosniff
```

#### Error Codes
- `400 Bad Request`: Invalid or mismatched booking ID / document ID.
- `401 Unauthorized`: Request lacks authenticated session or guest token.
- `403 Forbidden`: Authenticated user does not own the booking, or guest token is expired/invalid.
- `404 Not Found`: Booking or document record not found.

---

## 6. Maintenance & Disaster Recovery

### 6.1 Orphan File Prevention
If a document generation process fails mid-upload, any partially written GridFS stream is aborted and cleaned up via `deleteDocumentFromGridFS`.

### 6.2 Data Retention Policy
- Booking vouchers remain stored indefinitely to support accounting reconciliation and legal proof of reservation.
- Cancelled or superseded documents are retained with `generationStatus = "CANCELLED"` or `"SUPERSEDED"` rather than hard-deleted.
