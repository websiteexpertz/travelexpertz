import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/db";

function verifyToken(req: NextRequest) {
  // First try to get token from Authorization header
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  console.log("Auth header token:", token ? "Found" : "Not found");
  
  // If not found, try to get from cookies
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
    console.log("Cookie token:", token ? "Found" : "Not found");
  }

  if (!token) {
    console.error("No token found in header or cookies");
    console.log("Available cookies:", req.cookies.getAll().map(c => c.name));
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    console.log("Token verified successfully:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("=== Stats API Request ===");
    console.log("Request method:", req.method);
    console.log("Request headers:");
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'cookie') {
        console.log(`  ${key}: [REDACTED]`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    const user = verifyToken(req);
    if (!user) {
      console.error("Unauthorized - No valid token found in request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", {
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const db = await getDb();
    const collection = db.collection("ownerproperties");

    // Ensure user.userId is a valid ObjectId
    let ownerObjectId: ObjectId;
    try {
      ownerObjectId = new ObjectId(user.userId);
    } catch {
      console.error("Invalid owner ID:", user.userId);
      return NextResponse.json(
        { error: "Invalid owner ID format" },
        { status: 400 }
      );
    }

    console.log("Querying properties for ownerId:", ownerObjectId.toString());

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
    console.error("=== STATS ENDPOINT ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error type:", error.constructor.name);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
