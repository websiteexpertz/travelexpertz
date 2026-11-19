import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import {
  HERO_SLIDES_COLLECTION,
  StateHeroSlide,
  MAX_ACTIVE_SLIDES_PER_STATE,
  ensureHeroSlideIndexes,
} from "@/lib/models/state-hero";

export const dynamic = "force-dynamic";

// Allowed MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country")?.trim();
    const state = searchParams.get("state")?.trim();
    const city = searchParams.get("city")?.trim();
    const type = searchParams.get("type")?.toUpperCase(); // "STATE" | "CITY"

    await ensureHeroSlideIndexes();
    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);

    const query: any = {};
    if (country) {
      query.countryName = { $regex: new RegExp(`^${country}$`, "i") };
    }
    if (state) {
      query.stateName = { $regex: new RegExp(`^${state}$`, "i") };
    }

    if (city) {
      query.cityName = { $regex: new RegExp(`^${city}$`, "i") };
    } else if (type === "STATE") {
      query.$or = [{ cityName: "" }, { cityName: null }, { cityName: { $exists: false } }];
    } else if (type === "CITY") {
      query.cityName = { $exists: true, $nin: ["", null] };
    }

    const slides = await collection
      .find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .toArray();

    const activeCount = slides.filter((s) => s.isActive).length;

    return NextResponse.json({
      slides,
      activeCount,
      maxActiveAllowed: MAX_ACTIVE_SLIDES_PER_STATE,
    });
  } catch (error) {
    console.error("Error fetching admin hero banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await ensureHeroSlideIndexes();
    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);

    const contentType = request.headers.get("content-type") || "";

    let countryName = "";
    let countryId = "";
    let stateName = "";
    let stateId = "";
    let cityName = "";
    let cityId: string | null = null;
    let locationType: "STATE" | "CITY" = "STATE";
    let destinationName = "";
    let tagline = "";
    let description = "";
    let displayOrder = 1;
    let isActive = true;
    let imageUrl = "";
    let imagePublicId: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      countryName = (formData.get("countryName") as string)?.trim() || "India";
      countryId = (formData.get("countryId") as string)?.trim() || countryName.toLowerCase().replace(/\s+/g, "-");
      stateName = (formData.get("stateName") as string)?.trim() || "";
      stateId = (formData.get("stateId") as string)?.trim() || stateName.toLowerCase().replace(/\s+/g, "-");
      cityName = (formData.get("cityName") as string)?.trim() || "";
      cityId = (formData.get("cityId") as string)?.trim() || (cityName ? cityName.toLowerCase().replace(/\s+/g, "-") : null);
      locationType = cityName ? "CITY" : "STATE";
      destinationName = (formData.get("destinationName") as string)?.trim() || "";
      tagline = (formData.get("tagline") as string)?.trim() || "";
      description = (formData.get("description") as string)?.trim() || "";
      displayOrder = parseInt(formData.get("displayOrder") as string, 10) || 1;
      isActive = formData.get("isActive") === "true" || formData.get("isActive") === "1";

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
          country: countryName,
          state: stateName,
        });

        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      } else if (directImageUrl) {
        imageUrl = directImageUrl;
      }
    } else {
      const body = await request.json();
      countryName = body.countryName?.trim() || "India";
      countryId = body.countryId?.trim() || countryName.toLowerCase().replace(/\s+/g, "-");
      stateName = body.stateName?.trim() || "";
      stateId = body.stateId?.trim() || stateName.toLowerCase().replace(/\s+/g, "-");
      cityName = body.cityName?.trim() || "";
      cityId = body.cityId?.trim() || (cityName ? cityName.toLowerCase().replace(/\s+/g, "-") : null);
      locationType = cityName ? "CITY" : "STATE";
      destinationName = body.destinationName?.trim() || "";
      tagline = body.tagline?.trim() || "";
      description = body.description?.trim() || "";
      displayOrder = parseInt(body.displayOrder, 10) || 1;
      isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
      imageUrl = body.imageUrl?.trim() || "";
      imagePublicId = body.imagePublicId?.trim();
    }

    // Validation
    if (!stateName) {
      return NextResponse.json(
        { error: "State is required." },
        { status: 400 }
      );
    }
    if (!destinationName) {
      return NextResponse.json(
        { error: "Destination Location Name is required." },
        { status: 400 }
      );
    }
    if (!tagline) {
      return NextResponse.json(
        { error: "Destination Tagline is required." },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { error: "Destination Description is required." },
        { status: 400 }
      );
    }
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Hero Image is required." },
        { status: 400 }
      );
    }

    // Enforce 5-active-slide limit per state or per city
    if (isActive) {
      const activeFilter: any = { isActive: true };
      if (cityName) {
        activeFilter.cityName = { $regex: new RegExp(`^${cityName}$`, "i") };
      } else {
        activeFilter.stateName = { $regex: new RegExp(`^${stateName}$`, "i") };
        activeFilter.$or = [{ cityName: "" }, { cityName: null }, { cityName: { $exists: false } }];
      }

      const activeCount = await collection.countDocuments(activeFilter);

      if (activeCount >= MAX_ACTIVE_SLIDES_PER_STATE) {
        return NextResponse.json(
          {
            error: `Maximum ${MAX_ACTIVE_SLIDES_PER_STATE} active hero slides allowed for ${cityName || stateName}. Please deactivate another slide first or save this slide as Inactive.`,
          },
          { status: 400 }
        );
      }
    }

    // Ensure displayOrder is between 1 and 5
    const clampedOrder = Math.max(1, Math.min(MAX_ACTIVE_SLIDES_PER_STATE, displayOrder));

    const newSlide: StateHeroSlide = {
      countryId,
      countryName,
      stateId,
      stateName,
      cityName: cityName || "",
      cityId: cityId || null,
      locationType,
      destinationName,
      tagline,
      description,
      imageUrl,
      imagePublicId,
      displayOrder: clampedOrder,
      order: clampedOrder,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await collection.insertOne(newSlide);

    return NextResponse.json(
      {
        message: "Hero slide created successfully",
        slide: { ...newSlide, _id: insertResult.insertedId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
