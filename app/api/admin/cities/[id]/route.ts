import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// PUT: update city details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid city ID." }, { status: 400 });
    }

    const body = await request.json();
    const cityName = body.cityName?.trim() || body.name?.trim() || "";
    const active = body.active !== undefined ? Boolean(body.active) : true;
    const slug = body.slug?.trim();

    if (!cityName) {
      return NextResponse.json({ error: "City name cannot be empty." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("hotel_destinations");

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    // Check duplicate name within same state
    const duplicate = await collection.findOne({
      _id: { $ne: new ObjectId(id) },
      stateName: existing.stateName,
      cityName: { $regex: new RegExp(`^${cityName}$`, "i") },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Another city named "${cityName}" already exists in ${existing.stateName}.` },
        { status: 409 }
      );
    }

    const updateFields: any = {
      cityName,
      active,
      updatedAt: new Date(),
    };
    if (slug) updateFields.slug = slug;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ message: "City updated successfully." });
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json({ error: "Failed to update city." }, { status: 500 });
  }
}

// PATCH: toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid city ID." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("hotel_destinations");

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    const newActive = existing.active === false ? true : false;
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { active: newActive, updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: `City is now ${newActive ? "active" : "inactive"}.`,
      active: newActive,
    });
  } catch (error) {
    console.error("Error toggling city status:", error);
    return NextResponse.json({ error: "Failed to toggle city status." }, { status: 500 });
  }
}

// DELETE: safely delete city
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid city ID." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("hotel_destinations");

    const cityDoc = await collection.findOne({ _id: new ObjectId(id) });
    if (!cityDoc) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    const cityName = cityDoc.cityName?.trim();

    // Check if any properties reference this city
    if (cityName) {
      const propertyCount = await db.collection("hotels").countDocuments({
        city: { $regex: new RegExp(`^${cityName}$`, "i") },
      });

      if (propertyCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete "${cityName}" because ${propertyCount} property/hotel record(s) are located in this city. Please reassign or remove those properties first.`,
          },
          { status: 400 }
        );
      }

      // Check if any hero slides exist for this city
      const heroCount = await db.collection("state_hero_slides").countDocuments({
        cityName: { $regex: new RegExp(`^${cityName}$`, "i") },
      });

      if (heroCount > 0) {
        // Remove city hero slides safely
        await db.collection("state_hero_slides").deleteMany({
          cityName: { $regex: new RegExp(`^${cityName}$`, "i") },
        });
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: `City "${cityName}" deleted safely.` });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json({ error: "Failed to delete city." }, { status: 500 });
  }
}
