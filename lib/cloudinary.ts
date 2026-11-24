import crypto from "crypto";
import { getGridFSBucket } from "./db";
import { Readable } from "stream";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Retrieve Cloudinary configuration from environment variables.
 * Supports either individual variables or a single CLOUDINARY_URL.
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    try {
      const parsed = new URL(cloudinaryUrl);
      return {
        cloudName: parsed.hostname,
        apiKey: decodeURIComponent(parsed.username),
        apiSecret: decodeURIComponent(parsed.password),
      };
    } catch (e) {
      console.warn("Failed to parse CLOUDINARY_URL:", e);
    }
  }

  return null;
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  provider: "cloudinary" | "gridfs";
}

/**
 * Upload an image buffer to Cloudinary (or fallback to GridFS if Cloudinary is not configured).
 */
export async function uploadImage({
  buffer,
  filename,
  mimeType,
  country = "india",
  state = "generic",
}: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  country?: string;
  state?: string;
}): Promise<UploadResult> {
  const cloudinaryConfig = getCloudinaryConfig();

  // 1. Try Cloudinary if configured
  if (cloudinaryConfig) {
    try {
      const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
      const cleanCountry = country.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const cleanState = state.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const folder = `travelexpertz/state-heroes/${cleanCountry}/${cleanState}`;
      const timestamp = Math.floor(Date.now() / 1000);

      // Signature string: parameters sorted alphabetically
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + apiSecret)
        .digest("hex");

      const formData = new FormData();
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${mimeType || "image/jpeg"};base64,${base64Data}`;

      formData.append("file", dataUri);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id,
          provider: "cloudinary",
        };
      } else {
        const errText = await response.text();
        console.error("Cloudinary upload API returned error:", errText);
        // Fall back to GridFS
      }
    } catch (err) {
      console.error("Cloudinary upload failed, falling back to GridFS:", err);
    }
  }

  // 2. Fallback to MongoDB GridFS (existing media storage in project)
  const bucket = await getGridFSBucket("uploads");

  const safeName = filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
  const uniqueName = `${Date.now()}-${safeName}`;

  const readableStream = Readable.from(buffer);
  const uploadStream = bucket.openUploadStream(uniqueName, {
    metadata: {
      contentType: mimeType,
      originalName: filename,
      country,
      state,
      uploadedAt: new Date(),
    },
  });

  await new Promise((resolve, reject) => {
    readableStream.pipe(uploadStream).on("error", reject).on("finish", resolve);
  });

  return {
    url: `/api/files/${uploadStream.id}`,
    publicId: uploadStream.id.toString(),
    provider: "gridfs",
  };
}

/**
 * Delete an image asset from Cloudinary (or GridFS).
 */
export async function deleteImage(publicId: string, provider: "cloudinary" | "gridfs" = "cloudinary"): Promise<boolean> {
  if (!publicId) return false;

  const cloudinaryConfig = getCloudinaryConfig();
  if (provider === "cloudinary" && cloudinaryConfig) {
    try {
      const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + apiSecret)
        .digest("hex");

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );
      return res.ok;
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
      return false;
    }
  }

  return true;
}
