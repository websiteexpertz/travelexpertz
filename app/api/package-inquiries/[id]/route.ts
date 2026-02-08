import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * GET /api/package-inquiries/[id]
 * Get a specific inquiry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 });
    }

    const db = await getDb();
    const inquiriesCollection = db.collection("package_inquiries");

    const inquiry = await inquiriesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error("Fetch inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/package-inquiries/[id]
 * Update inquiry status and notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status, adminNotes } = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const inquiriesCollection = db.collection("package_inquiries");

    const result = await inquiriesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          adminNotes: adminNotes || "",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      inquiry: result,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Update inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 },
    );
  }
}
