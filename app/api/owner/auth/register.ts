import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    console.log("Register API: Parsing request body");
    const { email, password, businessName, ownerName, phone, businessType } =
      await req.json();
    
    console.log("Register API: Received data:", { email, businessName, ownerName, phone, businessType });

    if (!email || !password || !businessName || !ownerName || !phone) {
      console.log("Register API: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Register API: Connecting to MongoDB");
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("propertyowners");

    // Check if owner exists
    const existingOwner = await collection.findOne({ email });
    if (existingOwner) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new owner
    const newOwner = {
      email,
      password: hashedPassword,
      businessName,
      ownerName,
      phone,
      businessType,
      verified: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newOwner);

    return NextResponse.json(
      { message: "Registration successful", owner: { ...newOwner, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
