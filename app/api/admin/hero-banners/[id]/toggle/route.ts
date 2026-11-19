import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import {
  HERO_SLIDES_COLLECTION,
  StateHeroSlide,
  MAX_ACTIVE_SLIDES_PER_STATE,
} from "@/lib/models/state-hero";

export const dynamic = "force-dynamic";

export async function PATCH(
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

    const newActiveState = !existing.isActive;

    if (newActiveState) {
      // Check 5-active limit
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
            error: `Cannot activate: Maximum ${MAX_ACTIVE_SLIDES_PER_STATE} active slides already reached for ${existing.cityName || existing.stateName}. Please deactivate another slide first.`,
          },
          { status: 400 }
        );
      }
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: newActiveState, updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: `Slide is now ${newActiveState ? "Active" : "Inactive"}`,
      isActive: newActiveState,
    });
  } catch (error) {
    console.error("Error toggling slide status:", error);
    return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 });
  }
}
