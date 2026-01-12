import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "../jwt";
import { getDb } from "../db";
import { ObjectId } from "mongodb";

export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = 
      request.cookies.get("accessToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify user exists and is active
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Attach user info to request (for use in API handlers)
    return {
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

// Helper to extract user from request
export function getUserFromRequest(request: NextRequest) {
  const token = 
    request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token) return null;
  return verifyAccessToken(token);
}
