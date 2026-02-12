import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("propertyowners");

    // Find owner by email
    const owner = await collection.findOne({ email });
    if (!owner) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: owner._id.toString(),
        email: owner.email,
        role: "property_owner",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        token,
        owner: {
          _id: owner._id,
          email: owner.email,
          ownerName: owner.ownerName,
          businessName: owner.businessName,
          businessType: owner.businessType,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
