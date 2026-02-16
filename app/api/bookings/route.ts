import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/email";

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

    // Get owner ID from the property (homestay or hotel)
    let ownerId = null;
    try {
      const homestaysCollection = db.collection("homestays");
      const hotelsCollection = db.collection("hotels");
      const collection = isHotelBooking ? hotelsCollection : homestaysCollection;
      const property = await collection.findOne({ _id: new ObjectId(propertyId) });
      if (property && property.ownerId) {
        ownerId = new ObjectId(property.ownerId);
      }
    } catch (err) {
      console.error("Error fetching property owner:", err);
    }

    const booking = {
      ...body,
      [isHotelBooking ? "hotelId" : "homestayId"]: new ObjectId(propertyId),
      userId: body.userId ? new ObjectId(body.userId) : null,
      ownerId: ownerId,
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

    // After successful booking, decrement the room availability
    try {
      const homestaysCollection = db.collection("homestays");
      const hotelsCollection = db.collection("hotels");
      const collection = isHotelBooking ? hotelsCollection : homestaysCollection;

      // Update room availability - use findOneAndUpdate with array filters for safety
      const updateResult = await collection.updateOne(
        {
          _id: new ObjectId(propertyId),
          "rooms.id": body.roomId,
        },
        {
          $inc: { "rooms.$.availability": -1 },
        }
      );

      if (updateResult.matchedCount === 0) {
        console.warn(
          `No matching property/room found: propertyId=${propertyId}, roomId=${body.roomId}`
        );
      } else if (updateResult.modifiedCount === 0) {
        console.warn(`Room availability not updated for roomId=${body.roomId}`);
      }
    } catch (error) {
      console.error("Error updating room availability:", error);
      // Don't throw error - booking was still created successfully
    }

    // Send owner notification for confirmed bookings
    if (booking.bookingStatus === "confirmed") {
      try {
        const ownerpropertiesCollection = db.collection("ownerproperties");
        const property = await ownerpropertiesCollection.findOne({
          _id: new ObjectId(propertyId),
        });

        if (property && property.ownerId) {
          // Fetch owner details
          const propertyownersCollection = db.collection("propertyowners");
          const owner = await propertyownersCollection.findOne({
            _id: new ObjectId(property.ownerId),
          });

          if (owner && owner.email) {
            // Create notification in database
            const notificationsCollection = db.collection("owner_notifications");
            await notificationsCollection.insertOne({
              ownerId: new ObjectId(property.ownerId),
              bookingId: result.insertedId,
              type: "booking",
              title: "New Booking Received",
              message: `${body.guestName} has booked ${property.propertyName || property.name}`,
              data: {
                guestName: body.guestName,
                propertyName: property.propertyName || property.name,
                checkin: body.checkin,
                checkout: body.checkout,
                nights: nights,
                totalPrice: totalPrice,
                guestMessage: body.guestMessage || "",
              },
              isRead: false,
              createdAt: new Date(),
            });

            // Send email to owner
            const checkinDate = new Date(body.checkin).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const checkoutDate = new Date(body.checkout).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const emailHtml = `
              <h2 style="color: #0066cc;">New Booking Notification</h2>
              <p>Hello ${owner.ownerName || owner.name},</p>
              <p>You have received a new booking for your property!</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details</h3>
                <p><strong>Guest Name:</strong> ${body.guestName}</p>
                <p><strong>Property:</strong> ${property.propertyName || property.name}</p>
                <p><strong>Check-in:</strong> ${checkinDate}</p>
                <p><strong>Check-out:</strong> ${checkoutDate}</p>
                <p><strong>Number of Nights:</strong> ${nights}</p>
                <p><strong>Number of Guests:</strong> ${body.guests}</p>
                <p><strong>Total Amount:</strong> ₹${totalPrice.toFixed(2)}</p>
                ${body.guestMessage ? `<p><strong>Guest Message:</strong> ${body.guestMessage}</p>` : ""}
              </div>
              
              <p style="color: #666;">Please log in to your TravelExpertz dashboard to view complete details and manage this booking.</p>
              
              <p style="color: #0066cc;"><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://travelexpertz.com"}/owner/dashboard" style="color: #0066cc; text-decoration: none; font-weight: bold;">View in Dashboard →</a></p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">This is an automated notification from TravelExpertz. Please do not reply to this email.</p>
            `;

            await sendEmail({
              to: owner.email,
              subject: `New Booking: ${body.guestName} - ${property.propertyName || property.name}`,
              html: emailHtml,
            });

            console.log(`✅ Owner notification sent to ${owner.email}`);
          }
        }
      } catch (error) {
        console.error("Error sending owner notification:", error);
        // Don't throw error - booking was still created successfully
      }
    }

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

    // First, get the booking details to retrieve property and room info
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Cancel the booking
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

    // Restore room availability when booking is cancelled
    try {
      const isHotelBooking = !!booking.hotelId;
      const propertyId = booking.hotelId || booking.homestayId;

      if (propertyId && booking.roomId) {
        const homestaysCollection = db.collection("homestays");
        const hotelsCollection = db.collection("hotels");
        const collection = isHotelBooking
          ? hotelsCollection
          : homestaysCollection;

        // Increment room availability back by 1 (restore the cancelled booking)
        const updateResult = await collection.updateOne(
          {
            _id: new ObjectId(propertyId),
            "rooms.id": booking.roomId,
          },
          {
            $inc: { "rooms.$.availability": 1 },
          }
        );

        if (updateResult.matchedCount === 0) {
          console.warn(
            `No matching property/room found for restoration: propertyId=${propertyId}, roomId=${booking.roomId}`
          );
        } else if (updateResult.modifiedCount === 0) {
          console.warn(
            `Room availability not restored for roomId=${booking.roomId}`
          );
        } else {
          console.log(
            `Room availability restored for roomId=${booking.roomId}`
          );
        }
      }
    } catch (error) {
      console.error("Error restoring room availability:", error);
      // Don't throw error - booking was still cancelled successfully
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
