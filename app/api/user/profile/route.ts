import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";
import { hashPassword, verifyPassword, isValidPassword } from "@/lib/utils/auth";

/**
 * GET /api/user/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("user_profiles");

    const userDoc = await usersCollection.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const profile = await profilesCollection.findOne({ userId: new ObjectId(user.userId) });

    return NextResponse.json({
      user: {
        id: userDoc._id,
        mobile: userDoc.mobile,
        mobileVerified: userDoc.mobileVerified,
        isActive: userDoc.isActive,
        role: userDoc.role,
        createdAt: userDoc.createdAt,
      },
      profile: profile || {},
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update user profile
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "gender": "male",
 *   "dateOfBirth": "1990-01-01",
 *   "nationality": "Indian",
 *   "maritalStatus": "single",
 *   "anniversaryDate": "2020-06-15",
 *   "alternateContact": "9876543211",
 *   "city": "Mumbai",
 *   "state": "Maharashtra"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      email,
      gender,
      dateOfBirth,
      nationality,
      maritalStatus,
      anniversaryDate,
      alternateContact,
      city,
      state,
    } = data;

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const profilesCollection = db.collection("user_profiles");

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (nationality !== undefined) updateData.nationality = nationality;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (anniversaryDate !== undefined) updateData.anniversaryDate = new Date(anniversaryDate);
    if (alternateContact !== undefined) updateData.alternateContact = alternateContact;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;

    // Update or create profile
    const result = await profilesCollection.updateOne(
      { userId: new ObjectId(user.userId) },
      { $set: updateData },
      { upsert: true }
    );

    const updatedProfile = await profilesCollection.findOne({ userId: new ObjectId(user.userId) });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile/change-password
 * Change user password
 * 
 * Request Body:
 * {
 *   "currentPassword": "OldPass123",
 *   "newPassword": "NewPass456"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const userDoc = await usersCollection.findOne({ _id: new ObjectId(user.userId) });

    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await usersCollection.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
