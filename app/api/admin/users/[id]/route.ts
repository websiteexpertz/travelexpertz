import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// Verify admin token from custom JWT format
function verifyAdminToken(token: string): { username: string } | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    
    // Regenerate the signature exactly as the login does it
    const dataToSign = JWT_SECRET + header + payload;
    const regeneratedSignature = btoa(dataToSign);
    
    // Normalize signatures by removing base64 padding for comparison
    // (padding can be lost in cookie transmission)
    const normalizedToken = signature.replace(/=/g, "");
    const normalizedRegenerated = regeneratedSignature.replace(/=/g, "");
    
    // Compare normalized signatures
    if (normalizedToken !== normalizedRegenerated) {
      console.error("Signature verification failed");
      console.error("Token signature:", signature);
      console.error("Regenerated signature:", regeneratedSignature);
      return null;
    }

    // Decode and verify payload
    const decodedPayload = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp < now) {
      console.error("Token has expired");
      return null;
    }

    return { username: decodedPayload.username };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const verified = verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, role, status } = body;
    const { id } = await params;
    const userId = id;

    const db = await getDb();

    const updateData = {
      ...(name && { name }),
      ...(role && { role }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    // Try to update in users collection first
    let result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    // If not found in users, try propertyowners
    if (!result?.value) {
      result = await db
        .collection("propertyowners")
        .findOneAndUpdate(
          { _id: new ObjectId(userId) },
          { $set: updateData },
          { returnDocument: "after" },
        );
    }

    if (!result?.value) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const verified = verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const userId = id;
    const db = await getDb();

    // Try to delete from users collection first
    let result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(userId) });

    // If not found in users, try propertyowners
    if (result.deletedCount === 0) {
      result = await db
        .collection("propertyowners")
        .deleteOne({ _id: new ObjectId(userId) });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
