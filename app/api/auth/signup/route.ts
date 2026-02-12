import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, isValidPassword } from "@/lib/utils/auth";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

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
    const { email, password, name, role } = await request.json();

    console.log("=== SIGNUP REQUEST ===");
    console.log("Email:", email);
    console.log("Name:", name);
    console.log("Role:", role);
    console.log("Role type:", typeof role);

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
      console.error("OTP verification failed for email:", email.toLowerCase());
      console.error("Looking for OTP record with:");
      console.error({
        email: email.toLowerCase(),
        purpose: "signup",
        verified: true,
      });
      
      // Check if any OTP exists for debugging
      const anyOTP = await otpCollection.findOne({
        email: email.toLowerCase(),
      });
      console.error("Any OTP found:", anyOTP);
      
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

    // Determine role (default to "user" if not specified)
    const userRole = role === "owner" ? "owner" : "user";

    console.log("Determined role:", userRole);
    console.log("Is owner:", userRole === "owner");

    // If registering as owner, save to propertyowners collection instead
    if (userRole === "owner") {
      console.log("✓ OWNER REGISTRATION PATH - Creating in propertyowners collection");
      let client: MongoClient | null = null;
      try {
        client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
        await client.connect();
        const db = client.db("travelexpertz");
        const ownersCollection = db.collection("propertyowners");

        // Check if owner already exists
        const existingOwner = await ownersCollection.findOne({ email: email.toLowerCase() });
        if (existingOwner) {
          return NextResponse.json(
            { error: "Owner account already exists with this email address" },
            { status: 400 }
          );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create owner account in propertyowners collection
        const ownerResult = await ownersCollection.insertOne({
          email: email.toLowerCase(),
          password: hashedPassword,
          ownerName: name || "",
          businessName: name || "",
          businessType: "other",
          phone: "",
          verified: true, // Auto-verify since they went through OTP
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const ownerId = ownerResult.insertedId;

        // Generate JWT tokens with owner data
        const accessToken = jwt.sign(
          {
            userId: ownerId.toString(),
            email: email.toLowerCase(),
            role: "owner",
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "30d" }
        );

        const refreshToken = jwt.sign(
          {
            userId: ownerId.toString(),
            email: email.toLowerCase(),
            role: "owner",
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "60d" }
        );

        // Set cookies
        const response = NextResponse.json({
          success: true,
          message: "Owner signup successful!",
          user: {
            id: ownerId,
            email: email.toLowerCase(),
            name: name || "",
            role: "owner",
          },
          accessToken,
          refreshToken,
        });

        response.cookies.set("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        response.cookies.set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 24 * 60 * 60,
          path: "/",
        });

        return response;
      } catch (error) {
        console.error("Owner signup error:", error);
        return NextResponse.json(
          { error: "Failed to create owner account" },
          { status: 500 }
        );
      } finally {
        if (client) await client.close();
      }
    }

    // For regular users, continue with existing logic
    console.log("✓ REGULAR USER REGISTRATION PATH - Creating in users collection");
    
    // Create user
    const userResult = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || "",
      emailVerified: true,
      isActive: true,
      role: userRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = userResult.insertedId;

    // Create user profile
    await profilesCollection.insertOne({
      userId,
      name: name || "",
      email: email.toLowerCase(),
      role: userRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: userId.toString(),
      email: email.toLowerCase(),
      role: userRole,
    });

    const refreshToken = generateRefreshToken({
      userId: userId.toString(),
      email: email.toLowerCase(),
      role: userRole,
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
