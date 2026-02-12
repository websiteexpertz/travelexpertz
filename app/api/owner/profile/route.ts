import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017";

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    client = new MongoClient(dbUri);
    await client.connect();
    const db = client.db("travelexpertz");
    const owners = db.collection("propertyowners");

    const filter = ObjectId.isValid(user.userId)
      ? { _id: new ObjectId(user.userId) }
      : { email: user.email };

    const owner = await owners.findOne(filter);
    if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });

    const responseOwner = {
      _id: owner._id,
      email: owner.email,
      ownerName: owner.ownerName,
      businessName: owner.businessName,
      businessType: owner.businessType,
      phone: owner.phone || "",
      address: owner.address || "",
      city: owner.city || "",
      state: owner.state || "",
      languages: Array.isArray(owner.languages)
        ? owner.languages.join(", ")
        : owner.languages || "",
      verified: owner.verified ?? false,
      active: owner.active ?? true,
    };

    return NextResponse.json(responseOwner, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching owner profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

export async function PUT(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const allowedFields = [
      "ownerName",
      "businessName",
      "businessType",
      "phone",
      "address",
      "city",
      "state",
      "languages",
    ];

    const updateData: Record<string, any> = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === "languages") {
          const raw = body[field];
          const normalized = Array.isArray(raw)
            ? raw.map((v: any) => String(v).trim()).filter(Boolean)
            : String(raw)
                .split(",")
                .map((v: string) => v.trim())
                .filter(Boolean);
          updateData[field] = normalized;
        } else {
          updateData[field] = String(body[field]).trim();
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    client = new MongoClient(dbUri);
    await client.connect();
    const db = client.db("travelexpertz");
    const owners = db.collection("propertyowners");

    const filter = ObjectId.isValid(user.userId)
      ? { _id: new ObjectId(user.userId) }
      : { email: user.email };

    const result = await owners.findOneAndUpdate(
      filter,
      {
        $set: updateData,
        $setOnInsert: {
          email: user.email,
          role: "property_owner",
          active: true,
          verified: false,
          createdAt: new Date(),
        },
      },
      { returnDocument: "after", upsert: true }
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const updatedOwner = result.value;

    const responseOwner = {
      _id: updatedOwner._id,
      email: updatedOwner.email,
      ownerName: updatedOwner.ownerName,
      businessName: updatedOwner.businessName,
      businessType: updatedOwner.businessType,
      phone: updatedOwner.phone || "",
      address: updatedOwner.address || "",
      city: updatedOwner.city || "",
      state: updatedOwner.state || "",
      languages: Array.isArray(updatedOwner.languages)
        ? updatedOwner.languages.join(", ")
        : updatedOwner.languages || "",
      verified: updatedOwner.verified ?? false,
      active: updatedOwner.active ?? true,
    };

    return NextResponse.json(responseOwner, { status: 200 });
  } catch (error: any) {
    console.error("Error updating owner profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
