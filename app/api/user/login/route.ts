import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/utils/auth";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/**
 * POST /api/user/login
 * Login with email and password
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email address and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("user_profiles");
    const refreshTokenCollection = db.collection("refresh_tokens");

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await verifyPassword(password, user.password);
    } catch (pwError) {
      console.error("Password verification error:", pwError);
      return NextResponse.json(
        { error: "Password verification failed" },
        { status: 500 }
      );
    }
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user profile
    const profile = await profilesCollection.findOne({ userId: user._id });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await refreshTokenCollection.insertOne({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo: request.headers.get("user-agent") || "",
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
      createdAt: new Date(),
    });

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        mobile: user.mobile,
        name: profile?.name || "",
        role: user.role,
      },
      accessToken,
      refreshToken,
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
