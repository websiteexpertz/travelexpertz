import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  HERO_SLIDES_COLLECTION,
  StateHeroSlide,
  StateHeroSlidePublic,
  MAX_ACTIVE_SLIDES_PER_STATE,
  ensureHeroSlideIndexes,
} from "@/lib/models/state-hero";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityParam = (searchParams.get("city") || "").trim();
    const stateParam = (searchParams.get("state") || "").trim();
    const generalParam = (
      searchParams.get("destination") ||
      searchParams.get("location") ||
      ""
    ).trim();

    let primaryName = "";
    let secondaryName = "";

    if (cityParam) {
      primaryName = cityParam;
      secondaryName = stateParam;
    } else if (stateParam) {
      primaryName = stateParam;
    } else if (generalParam) {
      // Clean location (remove ", India", extraneous whitespace)
      const cleanLocation = generalParam
        .replace(/,\s*india$/i, "")
        .replace(/\s+india$/i, "")
        .trim();

      const parts = cleanLocation.split(",").map((p) => p.trim()).filter(Boolean);
      primaryName = parts[0] || cleanLocation;
      secondaryName = parts.length > 1 ? parts[1] : "";
    }

    if (!primaryName) {
      return NextResponse.json(
        { state: "", city: "", locationName: "", slides: [] },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    await ensureHeroSlideIndexes();
    const db = await getDb();
    const slidesCollection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);

    // Escape regex characters
    const escapedPrimary = primaryName.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    const primaryRegex = new RegExp(`^${escapedPrimary}$`, "i");
    const primaryWordRegex = new RegExp(`\\b${escapedPrimary}\\b`, "i");

    // 1. Try finding slides in state_hero_slides matching city OR state
    let slidesDocs: StateHeroSlide[] = [];

    if (cityParam) {
      // First check if specific city slides exist
      const cityFilter: any = {
        cityName: { $regex: primaryRegex },
        isActive: { $in: [true, "true", 1] },
      };
      slidesDocs = await slidesCollection
        .find(cityFilter)
        .sort({ displayOrder: 1, createdAt: 1 })
        .limit(MAX_ACTIVE_SLIDES_PER_STATE)
        .toArray();
    }

    if (slidesDocs.length === 0) {
      const slideFilter: any = {
        $or: [
          { cityName: { $regex: primaryRegex } },
          { stateName: { $regex: primaryRegex } },
          { stateId: primaryName.toLowerCase().replace(/\s+/g, "-") },
          { destinationName: { $regex: primaryWordRegex } },
        ],
        isActive: { $in: [true, "true", 1] },
      };

      if (secondaryName) {
        const escapedSec = secondaryName.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
        slideFilter.$or.push({ stateName: { $regex: new RegExp(`^${escapedSec}$`, "i") } });
      }

      slidesDocs = await slidesCollection
        .find(slideFilter)
        .sort({ displayOrder: 1, createdAt: 1 })
        .limit(MAX_ACTIVE_SLIDES_PER_STATE)
        .toArray();
    }

    // 2. If no custom slides found, check hotel_destinations for city or state data
    let resolvedStateName = slidesDocs[0]?.stateName || stateParam || primaryName;
    let resolvedCityName = slidesDocs[0]?.cityName || (cityParam ? primaryName : "");

    if (slidesDocs.length === 0) {
      const destinationsCollection = db.collection("hotel_destinations");

      // Check if primaryName is a city in hotel_destinations
      const cityDest = await destinationsCollection.findOne({
        cityName: { $regex: primaryRegex },
      });

      if (cityDest) {
        resolvedCityName = cityDest.cityName;
        resolvedStateName = cityDest.stateName || resolvedStateName;

        const cityData = cityDest.cityData || {};
        const attractions = [
          ...(cityData.thingsToDo || []),
          ...(cityData.famousAttractions || []),
          ...(cityData.topAttractions || []),
          ...(cityData.topDestinations || []),
        ];

        // Unique attractions
        const seen = new Set<string>();
        const uniqueAttractions = attractions.filter((item: any) => {
          if (!item.name || seen.has(item.name.toLowerCase())) return false;
          seen.add(item.name.toLowerCase());
          return true;
        });

        if (uniqueAttractions.length > 0) {
          const generatedSlides: StateHeroSlidePublic[] = uniqueAttractions
            .slice(0, MAX_ACTIVE_SLIDES_PER_STATE)
            .map((item: any, idx: number) => {
              const image =
                item.profileImage ||
                (item.images && item.images.length > 0 ? item.images[0] : "") ||
                "/New-images/Hotel.jpg";
              return {
                id: `city_${cityDest._id}_${idx}`,
                destinationName: `${item.name} – ${cityDest.cityName}, ${cityDest.stateName || ""}`.replace(/,\s*$/, ""),
                tagline: `Discover the Splendor of ${item.name}`,
                description:
                  item.description ||
                  `Experience the unique charm, natural wonders, and cultural heritage of ${item.name} in ${cityDest.cityName}.`,
                imageUrl: image,
                displayOrder: idx + 1,
              };
            });

          return NextResponse.json(
            {
              state: resolvedStateName,
              city: resolvedCityName,
              locationName: resolvedCityName || resolvedStateName,
              slides: generatedSlides,
            },
            {
              status: 200,
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            }
          );
        }
      }

      // Check if secondaryName (e.g. "Uttarakhand" from "Rishikesh, Uttarakhand") matches in state_hero_slides
      if (secondaryName) {
        const escapedSec = secondaryName.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
        const secFilter: any = {
          stateName: { $regex: new RegExp(`^${escapedSec}$`, "i") },
          isActive: { $in: [true, "true", 1] },
        };
        slidesDocs = await slidesCollection
          .find(secFilter)
          .sort({ displayOrder: 1, createdAt: 1 })
          .limit(MAX_ACTIVE_SLIDES_PER_STATE)
          .toArray();

        if (slidesDocs.length > 0) {
          resolvedStateName = slidesDocs[0].stateName;
        }
      }
    }

    const formattedSlides = slidesDocs.map((slide: any) => {
      let title = slide.title || "";
      let locationName = slide.locationName || "";
      if (!title && slide.destinationName) {
        const parts = slide.destinationName.split(/–|-/);
        title = parts[0]?.trim() || slide.destinationName;
        locationName = parts[1]?.trim() || "";
      }
      const headline = slide.headline || slide.tagline || "";
      return {
        id: slide._id ? slide._id.toString() : "",
        title,
        locationName,
        destinationName: slide.destinationName || `${title}${locationName ? ` – ${locationName}` : ""}`,
        headline,
        tagline: slide.tagline || headline,
        description: slide.description,
        imageUrl: slide.imageUrl,
        altText: slide.altText || `${title} ${headline}`,
        displayOrder: slide.displayOrder || slide.order || 1,
        order: slide.order || slide.displayOrder || 1,
      };
    });

    return NextResponse.json(
      {
        state: resolvedStateName,
        city: resolvedCityName,
        locationName: resolvedCityName || resolvedStateName,
        slides: formattedSlides,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero banners", state: "", city: "", locationName: "", slides: [] },
      { status: 500 }
    );
  }
}
