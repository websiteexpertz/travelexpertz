import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const setAccessToken = (response: NextResponse, token: string) => {
  response.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });
};

const setRefreshToken = (response: NextResponse, token: string) => {
  response.cookies.set("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
};

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
    const ownersCollection = db.collection("propertyowners");
    const usersCollection = db.collection("users");

    // Find owner by email - check propertyowners first, then users collection
    let owner = await ownersCollection.findOne({ email: email.toLowerCase() });
    
    // If not found in propertyowners, check users collection for owners created via admin
    if (!owner) {
      const userRecord = await usersCollection.findOne({ 
        email: email.toLowerCase(),
        role: "owner"
      });
      if (userRecord) {
        owner = userRecord;
      }
    }
    
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

    // Check if account is active
    // Handle multiple status field names: active (propertyowners), status (admin-created)
    const isActive = (owner.active !== false && owner.status !== "inactive" && owner.status !== "suspended");
    
    if (!isActive) {
      return NextResponse.json(
        { error: "Owner account is deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Generate JWT tokens with userId field for consistency
    const accessToken = jwt.sign(
      {
        userId: owner._id.toString(),
        email: owner.email,
        role: "owner",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    const refreshToken = jwt.sign(
      {
        userId: owner._id.toString(),
        email: owner.email,
        role: "owner",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "60d" }
    );

    // Create response with owner data (handle both propertyowners and users collection fields)
    const response = NextResponse.json(
      {
        accessToken,
        owner: {
          _id: owner._id,
          email: owner.email,
          ownerName: owner.ownerName || owner.name,
          businessName: owner.businessName || "",
          businessType: owner.businessType || "",
          role: "owner",
        },
      },
      { status: 200 }
    );

    // Set cookies
    console.log("Setting accessToken cookie...");
    setAccessToken(response, accessToken);
    console.log("Setting refreshToken cookie...");
    setRefreshToken(response, refreshToken);
    console.log("Cookies set. Response headers:", response.headers);

    return response;
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
