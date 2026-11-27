import { Db, ObjectId, GridFSBucket } from "mongodb";
import { getDb, getGridFSBucket } from "@/lib/db";
import { ReviewMediaItem } from "./types";

export const MAX_PHOTOS_PER_REVIEW = 5;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_VIDEOS_PER_REVIEW = 2;
export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm"];

export interface MediaValidationResult {
  valid: boolean;
  type: "photo" | "video";
  mimeType: string;
  sizeBytes: number;
  error?: string;
}

/**
 * Validates a media buffer against strict size, MIME type, and magic bytes.
 */
export function validateMediaBuffer(
  buffer: Buffer,
  originalFilename: string,
  declaredMime: string
): MediaValidationResult {
  const sizeBytes = buffer.length;
  const ext = originalFilename.split(".").pop()?.toLowerCase() || "";
  const mime = declaredMime.toLowerCase().trim();

  // 1. Photo validation
  if (ALLOWED_PHOTO_MIMES.includes(mime) || ["jpg", "jpeg", "png", "webp"].includes(ext)) {
    if (sizeBytes > MAX_PHOTO_SIZE_BYTES) {
      return {
        valid: false,
        type: "photo",
        mimeType: mime,
        sizeBytes,
        error: `Photograph exceeds the 5 MB size limit (size: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB)`,
      };
    }

    // Magic byte inspection
    let detectedMime = "";
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      detectedMime = "image/jpeg";
    } else if (
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      detectedMime = "image/png";
    } else if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      detectedMime = "image/webp";
    }

    if (!detectedMime) {
      return {
        valid: false,
        type: "photo",
        mimeType: mime,
        sizeBytes,
        error: "Corrupted or invalid image file signature. Only JPEG, PNG, and WebP are accepted.",
      };
    }

    return {
      valid: true,
      type: "photo",
      mimeType: detectedMime,
      sizeBytes,
    };
  }

  // 2. Video validation
  if (ALLOWED_VIDEO_MIMES.includes(mime) || ["mp4", "webm"].includes(ext)) {
    if (sizeBytes > MAX_VIDEO_SIZE_BYTES) {
      return {
        valid: false,
        type: "video",
        mimeType: mime,
        sizeBytes,
        error: `Video exceeds the 20 MB size limit (size: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB)`,
      };
    }

    // Magic byte inspection
    let detectedMime = "";
    if (
      buffer.length >= 8 &&
      buffer.toString("ascii", 4, 8) === "ftyp"
    ) {
      detectedMime = "video/mp4";
    } else if (
      buffer.length >= 4 &&
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      detectedMime = "video/webm";
    }

    if (!detectedMime) {
      return {
        valid: false,
        type: "video",
        mimeType: mime,
        sizeBytes,
        error: "Corrupted or unsupported video file signature. Only MP4 and WebM are accepted.",
      };
    }

    return {
      valid: true,
      type: "video",
      mimeType: detectedMime,
      sizeBytes,
    };
  }

  return {
    valid: false,
    type: "photo",
    mimeType: mime,
    sizeBytes,
    error: "Unsupported file type. Accepted formats: JPEG, PNG, WebP for photos; MP4, WebM for videos.",
  };
}

/**
 * Stores a validated review media file in GridFS with private unapproved initial status.
 */
export async function storeReviewMedia(
  fileBuffer: Buffer,
  metadata: {
    originalName: string;
    mimeType: string;
    mediaType: "photo" | "video";
    bookingId?: string;
    propertyId?: string;
    uploaderId?: string;
  },
  database?: Db
): Promise<ReviewMediaItem> {
  const bucket = database ? new GridFSBucket(database, { bucketName: "review_media" }) : await getGridFSBucket("review_media");
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const safeName = metadata.originalName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
  const filename = `${metadata.mediaType}-${timestamp}-${randomStr}-${safeName}`;

  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      contentType: metadata.mimeType,
      originalName: metadata.originalName,
      mediaType: metadata.mediaType,
      bookingId: metadata.bookingId,
      propertyId: metadata.propertyId,
      uploaderId: metadata.uploaderId,
      uploadedAt: new Date(),
      size: fileBuffer.length,
      approved: false, // Default: private/unapproved until review is approved
    },
  });

  await new Promise<void>((resolve, reject) => {
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve());
    uploadStream.end(fileBuffer);
  });

  const fileId = uploadStream.id.toString();
  const url = `/api/reviews/media/${fileId}`;

  return {
    type: metadata.mediaType,
    url,
    fileId,
    thumbnailUrl: metadata.mediaType === "photo" ? url : undefined,
    sizeBytes: fileBuffer.length,
    mimeType: metadata.mimeType,
  };
}

/**
 * Marks review media files as approved when an admin approves the review.
 */
export async function markReviewMediaApproval(
  fileIds: string[],
  approved: boolean,
  database?: Db
): Promise<void> {
  if (!fileIds || fileIds.length === 0) return;
  const db = database || (await getDb());
  const filesCol = db.collection("review_media.files");

  const objectIds = fileIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (objectIds.length > 0) {
    await filesCol.updateMany(
      { _id: { $in: objectIds } },
      { $set: { "metadata.approved": approved, "metadata.moderatedAt": new Date() } }
    );
  }
}

/**
 * Checks if a specific review media file is approved for public display.
 */
export async function isReviewMediaApproved(
  fileId: string,
  database?: Db
): Promise<boolean> {
  if (!ObjectId.isValid(fileId)) return false;
  const db = database || (await getDb());
  const file = await db.collection("review_media.files").findOne({ _id: new ObjectId(fileId) });
  return file?.metadata?.approved === true;
}
