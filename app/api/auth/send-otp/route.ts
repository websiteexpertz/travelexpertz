import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateOTP, isValidEmail } from "@/lib/utils/auth";
import { sendOTP } from "@/lib/services/email";

/**
 * POST /api/auth/send-otp
 * Send OTP to email address for signup/login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "purpose": "signup" | "login" | "reset_password"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, purpose = "signup" } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const otpCollection = db.collection("otp_verifications");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (purpose === "signup" && existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Please login." },
        { status: 400 }
      );
    }

    if ((purpose === "login" || purpose === "reset_password") && !existingUser) {
      return NextResponse.json(
        { error: "Email not registered. Please sign up." },
        { status: 404 }
      );
    }

    // Check for recent OTP (prevent spam)
    const recentOTP = await otpCollection.findOne({
      email: email.toLowerCase(),
      purpose,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // Last 1 minute
    });

    if (recentOTP) {
      return NextResponse.json(
        { error: "OTP already sent. Please wait 1 minute before requesting again." },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send OTP via email
    const emailSent = await sendOTP(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Store OTP in database
    await otpCollection.insertOne({
      email: email.toLowerCase(),
      otp,
      purpose,
      expiresAt,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
