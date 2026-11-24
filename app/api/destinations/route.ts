import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all"); // For admin - fetch all including inactive
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : null;

    const db = await getDb(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");

    // If ID is provided, fetch single destination
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid destination ID" }, { status: 400 });
      }
      const destination = await destinationsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!destination) {
        return NextResponse.json({ error: "Destination not found" }, { status: 404 });
      }

      return NextResponse.json(destination);
    }

    // Otherwise, fetch destinations (all for admin, active only for public)
    const query = all === "true" ? {} : { active: { $ne: false } };
    let cursor = destinationsCollection.find(query).sort({ order: 1, name: 1 });
    if (limit && limit > 0) {
      cursor = cursor.limit(limit);
    }
    const destinations = await cursor.toArray();

    return NextResponse.json(destinations, {
      headers: {
        "Cache-Control": all === "true"
          ? "no-store"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching destinations:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch destinations", details: errorMessage, destinations: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");
    const locationsCollection = db.collection("locations");

    const now = new Date();
    const destinationData = {
      ...body,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await destinationsCollection.insertOne(destinationData);

    // Also create location for this destination
    const locationData = {
      name: body.name,
      destinationId: result.insertedId,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    // Check if location already exists
    const existingLocation = await locationsCollection.findOne({
      name: { $regex: `^${body.name}$`, $options: "i" },
    });

    if (!existingLocation) {
      await locationsCollection.insertOne(locationData);
    }

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create destination:", error);
    return NextResponse.json(
      { error: "Failed to create destination" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid destination ID required" }, { status: 400 });
    }

    // Remove id and _id from the update payload (MongoDB doesn't allow updating _id)
    const { id: _id1, _id: _id2, ...updateData } = body;

    const db = await getDb(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");
    const locationsCollection = db.collection("locations");

    // Get the original destination to check if name changed
    const originalDestination = await destinationsCollection.findOne({
      _id: new ObjectId(id),
    });

    const result = await destinationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    // If name changed, update or create location
    if (originalDestination && updateData.name && originalDestination.name !== updateData.name) {
      const existingLocation = await locationsCollection.findOne({
        destinationId: new ObjectId(id),
      });

      if (existingLocation) {
        await locationsCollection.updateOne(
          { _id: existingLocation._id },
          { $set: { name: updateData.name, updatedAt: new Date() } }
        );
      } else {
        const nameExists = await locationsCollection.findOne({
          name: { $regex: `^${updateData.name}$`, $options: "i" },
        });

        if (!nameExists) {
          await locationsCollection.insertOne({
            name: updateData.name,
            destinationId: new ObjectId(id),
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update destination:", error);
    return NextResponse.json(
      { error: "Failed to update destination" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid destination ID required" }, { status: 400 });
    }

    const db = await getDb(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");
    const locationsCollection = db.collection("locations");

    const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    // Also delete associated location
    await locationsCollection.deleteOne({ destinationId: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete destination:", error);
    return NextResponse.json(
      { error: "Failed to delete destination" },
      { status: 500 }
    );
  }
}
