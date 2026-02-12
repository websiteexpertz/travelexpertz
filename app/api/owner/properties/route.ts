import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// Middleware to verify token
function verifyToken(req: NextRequest) {
  // First try to get token from Authorization header
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  
  // If not found, try to get from cookies
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const newProperty = {
      ownerId: new ObjectId(user.userId),
      ...body,
      status: "pending",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newProperty);

    return NextResponse.json(
      { message: "Property submitted", property: { ...newProperty, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create property" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
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

    const filter = req.nextUrl.searchParams.get("filter") || "all";
    const query: any = { ownerId: new ObjectId(user.userId) };

    if (filter !== "all") {
      query.status = filter;
    }

    const properties = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(properties, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch properties" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
