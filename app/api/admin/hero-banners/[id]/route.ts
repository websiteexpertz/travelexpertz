import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import {
  HERO_SLIDES_COLLECTION,
  StateHeroSlide,
  MAX_ACTIVE_SLIDES_PER_STATE,
} from "@/lib/models/state-hero";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);
    const slide = await collection.findOne({ _id: new ObjectId(id) });

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    return NextResponse.json({ error: "Failed to fetch slide" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let destinationName = existing.destinationName;
    let tagline = existing.tagline;
    let description = existing.description;
    let displayOrder = existing.displayOrder;
    let isActive = existing.isActive;
    let imageUrl = existing.imageUrl;
    let imagePublicId = existing.imagePublicId;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (formData.has("destinationName")) {
        destinationName = (formData.get("destinationName") as string).trim();
      }
      if (formData.has("tagline")) {
        tagline = (formData.get("tagline") as string).trim();
      }
      if (formData.has("description")) {
        description = (formData.get("description") as string).trim();
      }
      if (formData.has("displayOrder")) {
        displayOrder = parseInt(formData.get("displayOrder") as string, 10) || displayOrder;
      }
      if (formData.has("isActive")) {
        isActive = formData.get("isActive") === "true" || formData.get("isActive") === "1";
      }

      const file = formData.get("image") as File | null;
      const directImageUrl = (formData.get("imageUrl") as string)?.trim();

      if (file && file.size > 0) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "Invalid image format. Only JPG, PNG, and WebP are allowed." },
            { status: 400 }
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image file exceeds maximum allowed size of 10MB." },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await uploadImage({
          buffer,
          filename: file.name,
          mimeType: file.type,
          country: existing.countryName,
          state: existing.stateName,
        });

        // Delete old asset if replaced
        if (existing.imagePublicId) {
          await deleteImage(existing.imagePublicId);
        }

        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      } else if (directImageUrl) {
        imageUrl = directImageUrl;
      }
    } else {
      const body = await request.json();
      if (body.destinationName !== undefined) destinationName = body.destinationName.trim();
      if (body.tagline !== undefined) tagline = body.tagline.trim();
      if (body.description !== undefined) description = body.description.trim();
      if (body.displayOrder !== undefined) displayOrder = parseInt(body.displayOrder, 10) || displayOrder;
      if (body.isActive !== undefined) isActive = Boolean(body.isActive);
      if (body.imageUrl !== undefined && body.imageUrl.trim()) {
        imageUrl = body.imageUrl.trim();
        if (body.imagePublicId !== undefined) {
          imagePublicId = body.imagePublicId.trim();
        }
      }
    }

    // Validation
    if (!destinationName) {
      return NextResponse.json({ error: "Destination Name is required" }, { status: 400 });
    }
    if (!tagline) {
      return NextResponse.json({ error: "Destination Tagline is required" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "Destination Description is required" }, { status: 400 });
    }

    // If activating a previously inactive slide, check active count
    if (isActive && !existing.isActive) {
      const activeFilter: any = { isActive: true };
      if (existing.cityName) {
        activeFilter.cityName = { $regex: new RegExp(`^${existing.cityName}$`, "i") };
      } else {
        activeFilter.stateName = { $regex: new RegExp(`^${existing.stateName}$`, "i") };
        activeFilter.$or = [{ cityName: "" }, { cityName: null }, { cityName: { $exists: false } }];
      }

      const activeCount = await collection.countDocuments(activeFilter);

      if (activeCount >= MAX_ACTIVE_SLIDES_PER_STATE) {
        return NextResponse.json(
          {
            error: `Maximum ${MAX_ACTIVE_SLIDES_PER_STATE} active hero slides allowed for ${existing.cityName || existing.stateName}. Please deactivate another slide before activating this one.`,
          },
          { status: 400 }
        );
      }
    }

    const clampedOrder = Math.max(1, Math.min(MAX_ACTIVE_SLIDES_PER_STATE, displayOrder));

    const updateFields: any = {
      destinationName,
      tagline,
      description,
      displayOrder: clampedOrder,
      order: clampedOrder,
      isActive,
      imageUrl,
      imagePublicId,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({
      message: "Hero slide updated successfully",
      slide: { ...existing, ...updateFields },
    });
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);
    const existing = await collection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    // Clean up stored image in Cloudinary
    if (existing.imagePublicId) {
      await deleteImage(existing.imagePublicId);
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: "Hero slide deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 });
  }
}
