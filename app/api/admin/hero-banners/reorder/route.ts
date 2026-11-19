import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { HERO_SLIDES_COLLECTION, StateHeroSlide } from "@/lib/models/state-hero";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { orders } = body; // Array of { id: string, displayOrder: number }

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Invalid orders array provided" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);

    const bulkOps = orders
      .filter((item) => ObjectId.isValid(item.id))
      .map((item) => ({
        updateOne: {
          filter: { _id: new ObjectId(item.id) },
          update: {
            $set: {
              displayOrder: Math.max(1, Math.min(5, Number(item.displayOrder) || 1)),
              updatedAt: new Date(),
            },
          },
        },
      }));

    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: "Slides reordered successfully" });
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    return NextResponse.json({ error: "Failed to reorder slides" }, { status: 500 });
  }
}
