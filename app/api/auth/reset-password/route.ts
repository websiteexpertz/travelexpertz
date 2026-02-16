import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/utils/auth";

/**
 * POST /api/auth/reset-password
 * Reset password after OTP verification
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "NewSecurePass123",
 *   "accountType": "user" | "owner"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, accountType = "user" } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otpCollection = db.collection("otp_verifications");

    // Verify that OTP was verified for this email (reset_password purpose)
    const verifiedOTP = await otpCollection.findOne(
      {
        email: email.toLowerCase(),
        purpose: "reset_password",
        verified: true,
      },
      {
        sort: { createdAt: -1 },
      }
    );

    if (!verifiedOTP) {
      return NextResponse.json(
        { error: "OTP not verified. Please verify your OTP first." },
        { status: 400 }
      );
    }

    // Check OTP is not too old (max 30 minutes after verification)
    const otpAge = Date.now() - new Date(verifiedOTP.createdAt).getTime();
    if (otpAge > 30 * 60 * 1000) {
      return NextResponse.json(
        { error: "OTP session expired. Please start over." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    let updated = false;

    if (accountType === "owner") {
      // Update in propertyowners collection
      const ownersCollection = db.collection("propertyowners");
      const result = await ownersCollection.updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      );
      updated = result.modifiedCount > 0;

      // Also check users collection if not found in owners
      if (!updated) {
        const usersCollection = db.collection("users");
        const userResult = await usersCollection.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              password: hashedPassword,
              updatedAt: new Date(),
            },
          }
        );
        updated = userResult.modifiedCount > 0;
      }
    } else {
      // Update in users collection
      const usersCollection = db.collection("users");
      const result = await usersCollection.updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        }
      );
      updated = result.modifiedCount > 0;

      // Also check owners collection if not found in users
      if (!updated) {
        const ownersCollection = db.collection("propertyowners");
        const ownerResult = await ownersCollection.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              password: hashedPassword,
              updatedAt: new Date(),
            },
          }
        );
        updated = ownerResult.modifiedCount > 0;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: "User not found. Please check your email." },
        { status: 404 }
      );
    }

    // Clean up used OTP records for this email
    await otpCollection.deleteMany({
      email: email.toLowerCase(),
      purpose: "reset_password",
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
