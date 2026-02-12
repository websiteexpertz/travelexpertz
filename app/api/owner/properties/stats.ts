import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    // Ensure user.id is a valid ObjectId
    let ownerObjectId: ObjectId;
    try {
      ownerObjectId = new ObjectId(user.id);
    } catch {
      console.error("Invalid owner ID:", user.id);
      return NextResponse.json(
        { error: "Invalid owner ID format" },
        { status: 400 }
      );
    }

    const stats = await collection
      .aggregate([
        { $match: { ownerId: ownerObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat: any) => {
      if (stat._id === "pending") result.pending = stat.count;
      if (stat._id === "approved") result.approved = stat.count;
      if (stat._id === "rejected") result.rejected = stat.count;
      result.total += stat.count;
    });

    console.log("Stats calculated:", result);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stats endpoint error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
