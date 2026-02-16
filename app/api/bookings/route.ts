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
    // Check in ownerproperties first (has ownerId), then homestays/hotels collections
    let ownerId = null;
    try {
      const ownerPropertiesCollection = db.collection("ownerproperties");
      const homestaysCollection = db.collection("homestays");
      const hotelsCollection = db.collection("hotels");

      // First check if this property is in ownerproperties (most reliable)
      const ownerProperty = await ownerPropertiesCollection.findOne({
        _id: new ObjectId(propertyId),
      });
      
      if (ownerProperty && ownerProperty.ownerId) {
        ownerId = new ObjectId(ownerProperty.ownerId);
      } else {
        // Otherwise check homestays/hotels collections
        const collection = isHotelBooking ? hotelsCollection : homestaysCollection;
        const property = await collection.findOne({ _id: new ObjectId(propertyId) });
        
        if (property && property.ownerId) {
          ownerId = new ObjectId(property.ownerId);
        }
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
    let propertyName = "Property";
    if (booking.bookingStatus === "confirmed" && booking.ownerId) {
      if (booking.bookingStatus === "confirmed" && booking.ownerId) {
        try {
          console.log(
            `[Notification] Creating notification for booking ${result.insertedId}, owner ${booking.ownerId}`
          );

          // Create notification in database using the ownerId we already have
          const notificationsCollection = db.collection("owner_notifications");
          const homestaysCollection = db.collection("homestays");
          const hotelsCollection = db.collection("hotels");

          // Get property name
          try {
            const isHotel = !!booking.hotelId;
            const collection = isHotel ? hotelsCollection : homestaysCollection;
            const property = await collection.findOne({
              _id: new ObjectId(propertyId),
            });
            if (property) {
              propertyName = property.name || property.propertyName || "Property";
            }
          } catch (err) {
            console.error("Error fetching property name for notification:", err);
          }

          const notificationResult = await notificationsCollection.insertOne({
            ownerId: booking.ownerId,
            bookingId: result.insertedId,
            type: "booking",
            title: "New Booking Received",
            message: `${body.guestName} has booked ${propertyName}`,
            data: {
              guestName: body.guestName,
              propertyName: propertyName,
              checkin: body.checkin,
              checkout: body.checkout,
              nights: nights,
              totalPrice: totalPrice,
              guestMessage: body.guestMessage || "",
            },
            isRead: false,
            createdAt: new Date(),
          });

          console.log(
            `✅ Notification created: ${notificationResult.insertedId} for owner ${booking.ownerId}`
          );
        } catch (notificationErr) {
          console.error(
            `❌ Error creating notification for booking ${result.insertedId}:`,
            notificationErr
          );
          // Log to console so admin can see the failure
          console.error(`Notification creation failed but booking succeeded. Admin can run:`, {
            endpoint: "/api/init/initialize-notifications",
            bookingId: result.insertedId,
            ownerId: booking.ownerId,
          });
        }
      } else {
        console.log(
          `[Notification] Skipping notification - bookingStatus: ${booking.bookingStatus}, ownerId: ${booking.ownerId}`
        );
      }

      try {
        // Continue with email notification even if DB notification failed

        // Send email to owner (optional)
        try {
          const propertyownersCollection = db.collection("propertyowners");
          const owner = await propertyownersCollection.findOne({
            _id: new ObjectId(booking.ownerId),
          });

          if (owner && owner.email) {
            const { sendEmail } = await import("@/lib/services/email");
            
            // Fetch full property details for email
            let propertyDetails = {
              name: propertyName,
              roomType: "Standard Room",
              amenities: [] as string[],
              city: "",
              address: "",
              image: "",
            };

            try {
              const homestaysCollection = db.collection("homestays");
              const hotelsCollection = db.collection("hotels");
              const collection = isHotelBooking ? hotelsCollection : homestaysCollection;
              const property = await collection.findOne({ _id: new ObjectId(propertyId) });
              
              if (property) {
                propertyDetails.name = property.name || property.propertyName || property.hotelName || propertyName;
                propertyDetails.city = property.city || property.destination || "";
                propertyDetails.address = property.address || property.location || property.street || "";
                propertyDetails.image = property.image || property.images?.[0] || property.thumbnail || "";
                
                if (isHotelBooking) {
                  propertyDetails.roomType = property.roomType || property.room_type || "Standard Room";
                  propertyDetails.amenities = (property.amenities || property.facilities || []).slice(0, 4);
                } else {
                  const bedrooms = property.bedrooms || property.beds || 0;
                  const bathrooms = property.bathrooms || property.baths || 0;
                  propertyDetails.roomType = `${bedrooms}BR • ${bathrooms}BA`;
                  propertyDetails.amenities = property.amenities || property.facilities || [];
                }
              }
            } catch (err) {
              console.error("Error fetching detailed property info:", err);
            }
            
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

            const amenitiesHtml = propertyDetails.amenities.length > 0
              ? `<p><strong>Amenities:</strong> ${propertyDetails.amenities.join(", ")}</p>`
              : "";

            const imageHtml = propertyDetails.image
              ? `<div style="margin: 20px 0; text-align: center;"><img src="${propertyDetails.image}" alt="${propertyDetails.name}" style="max-width: 100%; max-height: 250px; border-radius: 8px;"></div>`
              : "";

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">✅ New Booking Received!</h2>
                
                <p>Hello <strong>${owner.ownerName || owner.name}</strong>,</p>
                <p>Great news! You have received a new booking for your property. Here are the details:</p>
                
                ${imageHtml}
                
                <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                  <h3 style="margin-top: 0; color: #1f2937;">📍 Property Details</h3>
                  <p style="margin: 8px 0;"><strong>Hotel Name:</strong> ${propertyDetails.name}</p>
                  <p style="margin: 8px 0;"><strong>Room Type:</strong> ${propertyDetails.roomType}</p>
                  ${propertyDetails.city ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${propertyDetails.city}</p>` : ""}
                  ${propertyDetails.address ? `<p style="margin: 8px 0;"><strong>Address:</strong> ${propertyDetails.address}</p>` : ""}
                  ${amenitiesHtml}
                </div>
                
                <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="margin-top: 0; color: #1f2937;">👤 Guest Information</h3>
                  <p style="margin: 8px 0;"><strong>Guest Name:</strong> ${body.guestName}</p>
                  <p style="margin: 8px 0;"><strong>Number of Guests:</strong> ${body.guests} person${body.guests > 1 ? "s" : ""}</p>
                  ${body.guestMessage ? `<p style="margin: 8px 0;"><strong>Guest Message:</strong> ${body.guestMessage}</p>` : ""}
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                  <h3 style="margin-top: 0; color: #1f2937;">📅 Booking Schedule</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                      <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Check-in</p>
                      <p style="margin: 5px 0 0; font-size: 1.1rem; font-weight: bold; color: #1f2937;">${checkinDate}</p>
                    </div>
                    <div>
                      <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Check-out</p>
                      <p style="margin: 5px 0 0; font-size: 1.1rem; font-weight: bold; color: #1f2937;">${checkoutDate}</p>
                    </div>
                  </div>
                  <p style="margin: 15px 0 0; color: #6b7280;"><strong>Number of Nights:</strong> ${nights} night${nights > 1 ? "s" : ""}</p>
                </div>
                
                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
                  <h3 style="margin-top: 0; color: #1f2937;">💰 Payment Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Base Price (${nights} night${nights > 1 ? "s" : ""})</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${basePrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Taxes (12% GST)</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${taxes.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Platform Fee (5%)</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${platformFee.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #d1d5db;">
                      <td style="padding: 12px 0; color: #1f2937; font-weight: bold; font-size: 1.1rem;">Total Amount</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 1.1rem; color: #0066cc;">₹${totalPrice.toFixed(2)}</td>
                    </tr>
                  </table>
                  <p style="margin: 12px 0 0; font-size: 0.9rem; color: #6b7280;"><strong>Booking Reference:</strong> ${bookingReference}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e;"><strong>⏳ Next Steps:</strong> Log in to your dashboard to confirm or manage this booking.</p>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://travelexpertz.com"}/owner/bookings" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Booking Details →</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 0.85rem; text-align: center; margin: 0;">
                  This is an automated notification from TravelExpertz. Please do not reply to this email.<br>
                  For support, contact: support@travelexpertz.com
                </p>
              </div>
            `;

            await sendEmail({
              to: owner.email,
              subject: `✅ New Booking: ${body.guestName} at ${propertyDetails.name}`,
              html: emailHtml,
            });

            console.log(`✅ Email sent to owner ${owner.email}`);
          }
        } catch (emailErr) {
          console.error("Error sending owner email:", emailErr);
          // Don't throw - notification was still created
        }
      } catch (error) {
        console.error("Error creating owner notification:", error);
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
