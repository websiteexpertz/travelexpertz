import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export interface TestimonialMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
}

export interface TestimonialItem {
  _id?: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  rating: number;
  reviewText: string;
  propertyId?: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  propertyType?: string;
  media: TestimonialMedia[];
  isPublished: boolean;
  createdAt: string | Date;
  // Backward compatibility fields
  name?: string;
  location?: string;
  image?: string;
  text?: string;
  verified?: boolean;
}

const SAMPLE_TESTIMONIALS: TestimonialItem[] = [
  {
    _id: "testm_1",
    reviewerName: "Aarav Mehta",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "Our family trip to Manali was truly unforgettable. The morning views of the snow-capped valley right from our balcony were breathtaking. Every detail was handled seamlessly by YatraExpertz from cab pickup to check-in.",
    propertyId: "prop_manali_retreat",
    propertyName: "The Himalayan Retreat Homestay",
    propertyCity: "Manali",
    propertyState: "Himachal Pradesh",
    propertyType: "Homestay",
    media: [
      {
        type: "photo",
        url: "/hero1.jpeg",
        thumbnailUrl: "/hero1.jpeg",
        altText: "Breathtaking mountain sunrise at The Himalayan Retreat Homestay in Manali",
      },
    ],
    isPublished: true,
    createdAt: new Date("2026-11-15T10:00:00Z").toISOString(),
  },
  {
    _id: "testm_2",
    reviewerName: "Riya & Kabir",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "We hosted our pre-wedding retreat at this stunning heritage property in Jaipur. The royal courtyards, traditional folk music in the evenings, and impeccable hospitality exceeded all our expectations!",
    propertyId: "prop_jaipur_palace",
    propertyName: "Heritage Palace & Spa Resort",
    propertyCity: "Jaipur",
    propertyState: "Rajasthan",
    propertyType: "Hotel",
    media: [
      {
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "/hero4.jpeg",
        altText: "Tour of Heritage Palace & Spa Resort grounds in Jaipur",
      },
    ],
    isPublished: true,
    createdAt: new Date("2026-11-18T14:30:00Z").toISOString(),
  },
  {
    _id: "testm_3",
    reviewerName: "Neha Sharma",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "Waking up to the sound of ocean waves at this beachfront villa in Goa was bliss. Clean private pool, sunset drinks on the deck, and super helpful staff. Highly recommend booking through YatraExpertz!",
    propertyId: "prop_goa_villa",
    propertyName: "Sea Breeze Luxury Beachfront Villa",
    propertyCity: "Calangute",
    propertyState: "Goa",
    propertyType: "Hotel",
    media: [
      {
        type: "photo",
        url: "/hero3.jpeg",
        thumbnailUrl: "/hero3.jpeg",
        altText: "Calangute beachfront villa pool and sea view",
      },
    ],
    isPublished: true,
    createdAt: new Date("2026-11-20T09:15:00Z").toISOString(),
  },
  {
    _id: "testm_4",
    reviewerName: "Vikramaditya Sen",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 4,
    reviewText:
      "Munnar's lush tea estates and misty mornings are therapeutic. Whispering Pines provided peaceful luxury surrounded by cardamom plantations. Trekking assistance arranged by the hosts was top-notch.",
    propertyId: "prop_munnar_pines",
    propertyName: "Whispering Pines Nature Resort",
    propertyCity: "Munnar",
    propertyState: "Kerala",
    propertyType: "Hotel",
    media: [
      {
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnailUrl: "/hero2.jpeg",
        altText: "Misty tea garden views from Whispering Pines resort in Munnar",
      },
    ],
    isPublished: true,
    createdAt: new Date("2026-11-21T16:00:00Z").toISOString(),
  },
  {
    _id: "testm_5",
    reviewerName: "Ananya Deshmukh",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "A magical weekend in Udaipur! Watching the sun set over Lake Pichola from the heritage rooftop dining area is an experience I will cherish forever. Everything was effortless.",
    propertyId: "prop_udaipur_haveli",
    propertyName: "Lakeview Heritage Haveli",
    propertyCity: "Udaipur",
    propertyState: "Rajasthan",
    propertyType: "Homestay",
    media: [
      {
        type: "photo",
        url: "/hero-bg.jpg",
        thumbnailUrl: "/hero-bg.jpg",
        altText: "Rooftop dining view of Lake Pichola Udaipur",
      },
    ],
    isPublished: true,
    createdAt: new Date("2026-11-22T11:45:00Z").toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const adminView = request.nextUrl.searchParams.get("admin") === "true";
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!, 10)
      : null;

    const db = await getDb(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const query = adminView
      ? {}
      : {
          $or: [
            { isPublished: true },
            { verified: true },
            { active: true },
          ],
        };

    const testimonials = await testimonialsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Map backwards compatibility fields if needed
    const normalized = (testimonials || []).map((t: any) => ({
      _id: t._id?.toString(),
      reviewerName: t.reviewerName || t.name || t.userName || "Traveler",
      reviewerAvatarUrl: t.reviewerAvatarUrl || t.image || t.userImage || "",
      rating: Number(t.rating) || 5,
      reviewText: t.reviewText || t.text || "",
      propertyId: t.propertyId || "",
      propertyName: t.propertyName || "",
      propertyCity: t.propertyCity || t.city || "",
      propertyState: t.propertyState || t.state || "",
      propertyType: t.propertyType || "Hotel",
      media: Array.isArray(t.media)
        ? t.media
        : t.image
        ? [{ type: "photo" as const, url: t.image, thumbnailUrl: t.image }]
        : [],
      isPublished:
        t.isPublished !== undefined
          ? t.isPublished
          : t.verified !== undefined
          ? t.verified
          : t.active !== undefined
          ? t.active
          : true,
      createdAt: t.createdAt || new Date().toISOString(),
    }));

    // Query approved reviews from reviews collection (approved by admin in /admin/reviews)
    let approvedReviews: any[] = [];
    if (!adminView) {
      try {
        const reviewsCollection = db.collection("reviews");
        const revs = await reviewsCollection
          .find({
            $or: [{ active: true }, { verified: true }, { isPublished: true }],
          })
          .sort({ createdAt: -1 })
          .limit(30)
          .toArray();

        approvedReviews = (revs || []).map((r: any) => ({
          _id: r._id?.toString(),
          reviewerName: r.userName || r.name || "Happy Traveller",
          reviewerAvatarUrl: r.userImage || r.image || "",
          rating: Number(r.rating) || 5,
          reviewText: r.reviewText || r.text || "",
          propertyId:
            r.propertyId !== "general_review" &&
            r.propertyId !== "homepage_review"
              ? r.propertyId
              : "",
          propertyName: r.propertyName || "YatraExpertz Journey",
          propertyCity: r.propertyCity || r.city || "",
          propertyState: r.propertyState || r.state || "",
          propertyType: r.propertyType || "Property",
          media:
            Array.isArray(r.media) && r.media.length > 0
              ? r.media
              : Array.isArray(r.reviewImages) && r.reviewImages.length > 0
              ? r.reviewImages.map((img: string) => ({
                  type: "photo" as const,
                  url: img,
                  thumbnailUrl: img,
                }))
              : [],
          isPublished: true,
          createdAt: r.createdAt || new Date().toISOString(),
        }));
      } catch (revErr) {
        console.warn("Could not query approved reviews:", revErr);
      }
    }

    // Merge approved user reviews with published reviews (either from database or sample published reviews)
    // so the carousel shows newly approved reviews alongside the existing published reviews.
    const publishedSamples = SAMPLE_TESTIMONIALS.filter((t) => t.isPublished);
    const existingPublished =
      normalized.length > 0 ? normalized : publishedSamples;

    const combinedMap = new Map<string, any>();
    // 1. Put newly accepted user reviews first
    approvedReviews.forEach((item) => {
      if (item && item._id) {
        combinedMap.set(item._id, item);
      }
    });
    // 2. Add existing published reviews
    existingPublished.forEach((item) => {
      if (item && item._id && !combinedMap.has(item._id)) {
        combinedMap.set(item._id, item);
      }
    });

    let allCombined = Array.from(combinedMap.values());
    if (limit && limit > 0) {
      allCombined = allCombined.slice(0, limit);
    }

    if (allCombined.length === 0) {
      const fallback = adminView
        ? SAMPLE_TESTIMONIALS
        : SAMPLE_TESTIMONIALS.filter((t) => t.isPublished);
      return NextResponse.json(
        limit ? fallback.slice(0, limit) : fallback,
        {
          headers: {
            "Cache-Control": adminView
              ? "no-store"
              : "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(allCombined, {
      headers: {
        "Cache-Control": adminView
          ? "no-store"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials, serving fallback:", error);
    const adminView = request.nextUrl.searchParams.get("admin") === "true";
    return NextResponse.json(
      adminView
        ? SAMPLE_TESTIMONIALS
        : SAMPLE_TESTIMONIALS.filter((t) => t.isPublished),
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const reviewerName = (body.reviewerName || body.name || "").trim();
    const reviewText = (body.reviewText || body.text || "").trim();

    if (!reviewerName) {
      return NextResponse.json(
        { error: "Reviewer name is required" },
        { status: 400 },
      );
    }
    if (!reviewText) {
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 },
      );
    }

    const newRecord = {
      reviewerName,
      reviewerAvatarUrl: body.reviewerAvatarUrl || body.image || "",
      rating: Number(body.rating) || 5,
      reviewText,
      propertyId: body.propertyId || "",
      propertyName: body.propertyName || "",
      propertyCity: body.propertyCity || "",
      propertyState: body.propertyState || "",
      propertyType: body.propertyType || "Hotel",
      media: Array.isArray(body.media) ? body.media : [],
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Legacy compatibility
      name: reviewerName,
      text: reviewText,
      verified: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    };

    const db = await getDb(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const result = await testimonialsCollection.insertOne(newRecord);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...newRecord },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Testimonial ID is required" },
        { status: 400 },
      );
    }

    const normalizedUpdates: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    if (updateData.reviewerName) {
      normalizedUpdates.name = updateData.reviewerName;
    }
    if (updateData.reviewText) {
      normalizedUpdates.text = updateData.reviewText;
    }
    if (updateData.isPublished !== undefined) {
      normalizedUpdates.verified = updateData.isPublished;
      normalizedUpdates.active = updateData.isPublished;
    }

    const db = await getDb(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const query: any = ObjectId.isValid(_id) ? { _id: new ObjectId(_id) } : { _id };

    const result = await testimonialsCollection.updateOne(query, {
      $set: normalizedUpdates,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Testimonial updated successfully",
      _id,
      ...normalizedUpdates,
    });
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Testimonial ID is required" },
        { status: 400 },
      );
    }

    const db = await getDb(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await testimonialsCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 },
    );
  }
}
