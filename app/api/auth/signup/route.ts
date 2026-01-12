import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, isValidPassword } from "@/lib/utils/auth";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/**
 * POST /api/auth/signup
 * Complete signup after OTP verification
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "name": "John Doe" (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email address and password are required" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("user_profiles");
    const otpCollection = db.collection("otp_verifications");
    const refreshTokenCollection = db.collection("refresh_tokens");

    // Verify OTP was verified
    const verifiedOTP = await otpCollection.findOne({
      email: email.toLowerCase(),
      purpose: "signup",
      verified: true,
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Within last 15 minutes
    });

    if (!verifiedOTP) {
      return NextResponse.json(
        { error: "OTP not verified or expired. Please verify OTP first." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email address" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userResult = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = userResult.insertedId;

    // Create user profile
    await profilesCollection.insertOne({
      userId,
      name: name || "",
      email: email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: userId.toString(),
      email: email.toLowerCase(),
      role: "user",
    });

    const refreshToken = generateRefreshToken({
      userId: userId.toString(),
      email: email.toLowerCase(),
      role: "user",
    });

    // Store refresh token
    await refreshTokenCollection.insertOne({
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });

    // Set cookies
    const response = NextResponse.json({
      success: true,
      message: "Signup successful!",
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name || "",
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
