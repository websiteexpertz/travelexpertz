import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  // First try to get token from Authorization header
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  
  // If not found, try to get from cookies
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) return null;

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const property = await collection.findOne({ _id: new ObjectId(id) });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.ownerId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const property = await collection.findOne({ _id: new ObjectId(id) });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.ownerId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated.value);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const property = await collection.findOne({ _id: new ObjectId(id) });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.ownerId.toString() !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Property deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
