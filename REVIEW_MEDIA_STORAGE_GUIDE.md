# Yatra Expertz — Review Media Storage & Streaming Guide

## 1. Overview
The Review Media Engine provides secure, optimized storage and streaming for photographs and videos uploaded by verified guests. Media is stored in MongoDB GridFS under the dedicated `review_media` bucket.

---

## 2. Configurable Upload Limits

| Parameter | Photographs | Videos |
|---|---|---|
| **Max Count per Review** | 5 files | 2 files |
| **Max File Size** | 5 MB (5,242,880 bytes) | 20 MB (20,971,520 bytes) |
| **Permitted MIME Types** | `image/jpeg`, `image/png`, `image/webp` | `video/mp4`, `video/webm` |
| **Permitted Extensions** | `.jpg`, `.jpeg`, `.png`, `.webp` | `.mp4`, `.webm` |
| **Validation Mechanism** | Magic bytes + MIME + extension | Magic bytes (`ftyp`, `EBML`) + extension |

---

## 3. Security & Access Control

### 3.1 Private-by-Default Storage
All media files uploaded during the review workflow are initialized with:
```typescript
metadata: {
  approved: false,
  uploadedAt: new Date(),
  mediaType: "photo" | "video",
  bookingId: authorizedBookingId,
  contentType: mimeType
}
```

### 3.2 Public Streaming Protection
The media delivery endpoint (`/api/reviews/media/[id]`) strictly guards file access:
- If `metadata.approved === true`: streamed with high-performance HTTP caching (`Cache-Control: public, max-age=86400`).
- If `metadata.approved !== true`:
  - Public requests without credentials receive **`403 Forbidden`**.
  - Authorized requests (admin session via `x-admin-request: true` or guest with matching cryptographic review invitation token) are permitted with `Cache-Control: private, no-store`.

### 3.3 Strict Content Type & Magic Byte Validation
To prevent disguised executables and malicious files:
- **JPEG**: Header prefix must match `FF D8 FF`.
- **PNG**: Header prefix must match `89 50 4E 47`.
- **WebP**: Bytes 0–4 must match `RIFF` and bytes 8–12 must match `WEBP`.
- **MP4**: Bytes 4–8 must match `ftyp`.
- **WebM**: Bytes 0–4 must match `1A 45 DF A3` (EBML identifier).

---

## 4. Serverless & Vercel Upload Constraints

Vercel Serverless Functions enforce a 4.5 MB request body limit for single standard serverless payloads. To support 5 MB photos and 20 MB videos without external paid cloud services:
1. **Dedicated Multi-Part Route**: Media is uploaded through `/api/reviews/upload-media` as independent individual files rather than bundling multiple files in the review submission payload.
2. **Streaming Directly to GridFS**: Buffers are streamed directly into MongoDB GridFS without maintaining unnecessary in-memory buffers across requests.
3. **Chunked / Large Video Handling**: For videos approaching the 20 MB threshold, chunked or direct streams are used with `nodejs` runtime and `maxDuration = 60` seconds.

---

## 5. Lifecycle Synchronization

1. **Review Submission**: Media is uploaded and linked via `ReviewMediaItem` references (`url`, `fileId`, `type`, `mimeType`).
2. **Review Approval**: When an administrator approves a review in `/admin/reviews`, `markReviewMediaApproval(fileIds, true)` updates `metadata.approved = true` across all associated GridFS records.
3. **Review Rejection / Hiding**: If a review is rejected or hidden, `markReviewMediaApproval(fileIds, false)` revokes public media accessibility immediately.
4. **Abandoned Upload Cleanup**: A periodic background maintenance task scans for unlinked media older than 7 days where `approved === false` and no associated review exists, removing orphaned GridFS chunks.
