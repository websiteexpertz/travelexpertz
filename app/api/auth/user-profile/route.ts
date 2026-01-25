import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

/**
 * GET /api/auth/user-profile
 * Fetch the current user's profile based on authentication token
 * 
 * Headers:
 * Authorization: Bearer <token> OR Cookie: accessToken=<token>
 */
export async function GET(request: NextRequest) {
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
      console.error("Token verification failed");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("Token payload:", payload);

    // Get database and fetch user
    const db = await getDb();
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("user_profiles");
    
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.userId),
      isActive: true,
    });

    if (!user) {
      console.error("User not found for userId:", payload.userId);
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 404 }
      );
    }

    // Also fetch user profile for additional info
    const userProfile = await profilesCollection.findOne({
      userId: new ObjectId(payload.userId),
    });

    // Merge user data with profile data, prioritizing profile data if it exists
    const userName = userProfile?.name || user.name || user.fullName || user.firstName || user.mobile || user.email || "User";
    const userImage = userProfile?.profileImage || userProfile?.image || user.profileImage || user.image || user.avatar || "";
    
    console.log("User profile endpoint - returning:", { userId: payload.userId, userName, email: user.email }); // Debug log
    
    return NextResponse.json({
      _id: payload.userId, // Use userId from token to ensure consistency
      name: userName,
      email: user.email || "",
      mobile: user.mobile || "",
      image: userImage,
      role: user.role || "user",
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
