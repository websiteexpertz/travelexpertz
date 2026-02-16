import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "travel");

    const hotelsCollection = db.collection("hotels");
    const bookingsCollection = db.collection("bookings");

    // Get all bookings with hotelId
    const bookingsWithoutHotels = await bookingsCollection
      .aggregate([
        {
          $match: {
            hotelId: { $exists: true, $ne: null },
          },
        },
        {
          $lookup: {
            from: "hotels",
            localField: "hotelId",
            foreignField: "_id",
            as: "hotelDetails",
          },
        },
        {
          $match: {
            hotelDetails: { $size: 0 },
          },
        },
      ])
      .toArray();

    console.log(`[Fix Hotels] Found ${bookingsWithoutHotels.length} bookings without hotel documents`);

    let created = 0;
    const createdHotels = [];

    for (const booking of bookingsWithoutHotels) {
      try {
        // Create hotel document
        const hotelId = new ObjectId(booking.hotelId);
        
        const hotelExists = await hotelsCollection.findOne({ _id: hotelId });
        if (!hotelExists) {
          const hotelData = {
            _id: hotelId,
            name: `Hotel ${booking.guestName}'s Booking`,
            hotelName: `Premium Hotel - ${booking.city || "Unknown Location"}`,
            city: booking.city || "Destination City",
            destination: booking.city || "Destination",
            address: `Property Address for Booking ${booking._id.toString().slice(0, 8)}`,
            location: `${booking.city || "City"}, India`,
            street: "Main Street",
            roomType: "Deluxe",
            room_type: "Deluxe Room",
            amenities: [
              "Air Conditioning",
              "Free WiFi",
              "24/7 Room Service",
              "Flat Screen TV",
            ],
            facilities: ["Restaurant", "Bar", "Gym", "Swimming Pool"],
            price: booking.basePrice || 5000,
            pricePerNight: booking.basePrice || 5000,
            image: "https://via.placeholder.com/300x200?text=Hotel",
            images: [
              "https://via.placeholder.com/300x200?text=Hotel+Room+1",
              "https://via.placeholder.com/300x200?text=Hotel+Room+2",
            ],
            thumbnail: "https://via.placeholder.com/150x150?text=Hotel",
            description: `Comfortable and modern hotel accommodation for your stay`,
            rating: 4.5,
            reviews: 250,
            ownerId: booking.ownerId,
            createdAt: new Date(),
          };

          const result = await hotelsCollection.insertOne(hotelData);
          created++;
          createdHotels.push({
            hotelId: result.insertedId,
            hotelName: hotelData.hotelName,
            bookingId: booking._id,
          });

          console.log(`[Fix Hotels] Created hotel ${result.insertedId} for booking ${booking._id}`);
        }
      } catch (err) {
        console.error(`[Fix Hotels] Error creating hotel for booking ${booking._id}:`, err);
      }
    }

    await client.close();

    return NextResponse.json({
      status: "success",
      message: `Created ${created} missing hotel documents`,
      created: created,
      createdHotels: createdHotels,
    });
  } catch (error) {
    console.error("[Fix Hotels] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
