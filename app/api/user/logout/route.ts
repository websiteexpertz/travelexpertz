import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";

/**
 * POST /api/user/logout
 * Logout user and invalidate refresh token
 * 
 * Query params:
 * ?all=true - Logout from all devices
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const refreshTokenCollection = db.collection("refresh_tokens");

    // Get query param
    const { searchParams } = new URL(request.url);
    const logoutAll = searchParams.get("all") === "true";

    if (logoutAll) {
      // Logout from all devices
      await refreshTokenCollection.deleteMany({
        userId: new ObjectId(user.userId),
      });
    } else {
      // Logout from current device only
      const refreshToken = request.cookies.get("refreshToken")?.value;
      if (refreshToken) {
        await refreshTokenCollection.deleteOne({
          userId: new ObjectId(user.userId),
          token: refreshToken,
        });
      }
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: logoutAll ? "Logged out from all devices" : "Logged out successfully",
    });

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
