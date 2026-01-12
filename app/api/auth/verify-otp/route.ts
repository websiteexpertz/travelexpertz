import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * POST /api/auth/verify-otp
 * Verify OTP entered by user
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "otp": "123456",
 *   "purpose": "signup" | "login" | "reset_password"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose = "signup" } = await request.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email address and OTP are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otpCollection = db.collection("otp_verifications");

    // Find OTP record
    const otpRecord = await otpCollection.findOne({
      email: email.toLowerCase(),
      purpose,
      verified: false,
    }, {
      sort: { createdAt: -1 }, // Get latest OTP
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum OTP attempts exceeded. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await otpCollection.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );

      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { verified: true } }
    );

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      email: email.toLowerCase(),
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
