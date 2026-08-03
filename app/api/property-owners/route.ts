import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/property-owners
 * Fetch all property owner accounts
 * Returns: [{ _id, name, email, phone }]
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin token
    const token = request.cookies.get("adminToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI || "");
    await client.connect();

    const db = client.db("travelexpertz");
    const propertyownersCollection = db.collection("propertyowners");

    // Fetch all active property owners
    const owners = await propertyownersCollection
      .find({ active: { $ne: false } })
      .project({
        _id: 1,
        ownerName: 1,
        email: 1,
        phone: 1,
        businessName: 1,
        createdAt: 1,
      })
      .toArray();

    // Format response
    const formattedOwners = owners.map((owner: any) => ({
      _id: owner._id.toString(),
      name: owner.ownerName || owner.businessName || "Unknown",
      email: owner.email || "",
      phone: owner.phone || "",
      verified: true,
    }));

    await client.close();

    return NextResponse.json(formattedOwners);
  } catch (error) {
    console.error("Error fetching property owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch property owners" },
      { status: 500 }
    );
  }
}
