import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "travelexpertz";

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

// GET - Fetch bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    const homestayId = searchParams.get("homestayId");
    const status = searchParams.get("status");

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");

    // Get single booking by ID
    if (id) {
      const booking = await bookingsCollection.findOne({
        _id: new ObjectId(id),
      });
      
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Populate homestay details
      const homestaysCollection = db.collection("homestays");
      const homestay = await homestaysCollection.findOne({
        _id: new ObjectId(booking.homestayId),
      });

      return NextResponse.json({
        ...booking,
        homestay,
      });
    }

    // Build filter
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (homestayId) filter.homestayId = new ObjectId(homestayId);
    if (status) filter.bookingStatus = status;

    const bookings = await bookingsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "roomId",
      "guestName",
      "guestEmail",
      "checkin",
      "checkout",
      "guests",
    ];
    
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if this is a hotel or homestay booking
    const isHotelBooking = !!body.hotelId;
    const propertyId = body.hotelId || body.homestayId;

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");

    // Calculate nights
    const checkin = new Date(body.checkin);
    const checkout = new Date(body.checkout);
    const nights = Math.ceil(
      (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const basePrice = (body.basePrice || 0) * nights;
    const taxes = basePrice * 0.12; // 12% GST
    const platformFee = basePrice * 0.05; // 5% platform fee
    const totalPrice = basePrice + taxes + platformFee;

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Check availability
    const conflicts = await bookingsCollection
      .find({
        [isHotelBooking ? "hotelId" : "homestayId"]: new ObjectId(propertyId),
        roomId: body.roomId,
        bookingStatus: { $in: ["confirmed", "pending"] },
        $or: [
          {
            checkin: { $lte: checkout },
            checkout: { $gte: checkin },
          },
        ],
      })
      .toArray();

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "Room is not available for selected dates" },
        { status: 409 }
      );
    }

    const booking = {
      ...body,
      [isHotelBooking ? "hotelId" : "homestayId"]: new ObjectId(propertyId),
      userId: body.userId ? new ObjectId(body.userId) : null,
      nights,
      basePrice,
      taxes,
      platformFee,
      totalPrice,
      bookingReference,
      paymentStatus: "completed", // Auto-complete for demo
      bookingStatus: body.userId ? "confirmed" : "pending", // Auto-confirm if user logged in
      refundStatus: "none",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(booking);

    return NextResponse.json(
      {
        ...booking,
        _id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    // Auto-confirm if payment is successful
    if (body.paymentStatus === "paid" && !body.bookingStatus) {
      updateData.bookingStatus = "confirmed";
    }

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

// DELETE - Cancel booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");

    const result = await bookingsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          bookingStatus: "cancelled",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
