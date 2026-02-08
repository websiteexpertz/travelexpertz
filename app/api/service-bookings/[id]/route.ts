import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bookingsCollection = db.collection("serviceBookings");

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    
    if (body.status) updateData.status = body.status;
    if (body.notes) updateData.notes = body.notes;

    const result = await bookingsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bookingsCollection = db.collection("serviceBookings");

    const result = await bookingsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
