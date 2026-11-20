import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      propertyName,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guestCount,
      message,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const inquiriesCollection = db.collection("property_inquiries");

    let propObjectId = null;
    if (propertyId && ObjectId.isValid(propertyId)) {
      propObjectId = new ObjectId(propertyId);
    }

    // Try finding property owner if exists
    let ownerId = null;
    if (propObjectId) {
      const homestay = await db.collection("homestays").findOne({ _id: propObjectId });
      const ownerProp = await db.collection("ownerproperties").findOne({ _id: propObjectId });
      ownerId = homestay?.ownerId || ownerProp?.ownerId || null;
    }

    const record = {
      propertyId: propObjectId || propertyId,
      propertyName: propertyName || "Homestay",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      checkInDate: checkInDate || null,
      checkOutDate: checkOutDate || null,
      guestCount: Number(guestCount || 1),
      message: message ? message.trim() : "",
      ownerId: ownerId ? new ObjectId(ownerId) : null,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await inquiriesCollection.insertOne(record);

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiryId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Error creating property inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit inquiry", error: error?.message },
      { status: 500 }
    );
  }
}
