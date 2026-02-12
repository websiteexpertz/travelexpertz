import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// Verify admin token from custom JWT format
function verifyAdminToken(token: string): { username: string } | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token parts, expected 3, got", parts.length);
      return null;
    }

    const [header, payload, signature] = parts;
    
    // Regenerate the signature exactly as the login does it
    const dataToSign = JWT_SECRET + header + payload;
    const regeneratedSignature = btoa(dataToSign);
    
    // Normalize signatures by removing base64 padding for comparison
    // (padding can be lost in cookie transmission)
    const normalizedToken = signature.replace(/=/g, "");
    const normalizedRegenerated = regeneratedSignature.replace(/=/g, "");
    
    console.log("Token signature (normalized):", normalizedToken.substring(0, 50) + "...");
    console.log("Regenerated signature (normalized):", normalizedRegenerated.substring(0, 50) + "...");
    console.log("Signatures match:", normalizedToken === normalizedRegenerated);
    
    // Compare normalized signatures
    if (normalizedToken !== normalizedRegenerated) {
      console.error("Signature verification failed - signatures do not match");
      console.error("Full token sig:", signature);
      console.error("Full regen sig:", regeneratedSignature);
      return null;
    }

    // Decode and verify payload
    const decodedPayload = JSON.parse(atob(payload));
    console.log("Decoded payload:", decodedPayload);
    
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp < now) {
      console.error("Token has expired");
      return null;
    }

    console.log("Token verified successfully!");
    return { username: decodedPayload.username };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const cookieHeader = request.headers.get("Cookie") || "";
    console.log("Cookie header:", cookieHeader);
    
    const cookies = cookieHeader.split("; ").reduce(
      (acc: any, cookie: string) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      },
      {},
    );
    const token = cookies.adminToken;

    console.log("Available cookies:", Object.keys(cookies));
    console.log("Admin token found:", !!token);

    if (!token) {
      console.error("No admin token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const verified = verifyAdminToken(token);
    if (!verified) {
      console.error("Invalid admin token");
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const db = await getDb();
    
    // Get all users from both collections
    const [regularUsers, ownerUsers] = await Promise.all([
      db.collection("users").find({}).toArray(),
      db.collection("propertyowners").find({}).toArray(),
    ]);

    // Format owners to match user structure
    const formattedOwners = ownerUsers.map((owner: any) => ({
      _id: owner._id || new ObjectId(),
      email: owner.email,
      name: owner.ownerName,
      role: "owner",
      status: owner.status || "active",
      createdAt: owner.createdAt || new Date(),
    }));

    // Format regular users
    const formattedUsers = regularUsers.map((user: any) => ({
      _id: user._id || new ObjectId(),
      email: user.email,
      name: user.name,
      role: user.role || "user",
      status: user.status || "active",
      createdAt: user.createdAt || new Date(),
    }));

    const allUsers = [...formattedUsers, ...formattedOwners];

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = cookieHeader.split("; ").reduce(
      (acc: any, cookie: string) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      },
      {},
    );
    const token = cookies.adminToken;

    if (!token) {
      console.error("No admin token found in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const verified = verifyAdminToken(token);
    if (!verified) {
      console.error("Invalid admin token");
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { email, name, role, status } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const newUser = {
      email,
      name: name || "",
      role: role || "user",
      status: status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({
      _id: result.insertedId,
      ...newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
