import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const { status, rejectionReason, notes } = await req.json();

    const updateData: any = {
      status,
      approvedAt: new Date(),
      approvalNotes: notes,
    };

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Property ${status} successfully`,
      property: result.value,
    });
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const property = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
