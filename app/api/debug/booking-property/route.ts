import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const bookingId = request.nextUrl.searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId query parameter required" },
      { status: 400 }
    );
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "travel");

    const bookingsCollection = db.collection("bookings");
    const hotelsCollection = db.collection("hotels");
    const homestaysCollection = db.collection("homestays");

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
    });

    if (!booking) {
      await client.close();
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    let property = null;
    let propertyCollection = "unknown";

    if (booking.hotelId) {
      property = await hotelsCollection.findOne({
        _id: new ObjectId(booking.hotelId),
      });
      propertyCollection = "hotels";
    } else if (booking.homestayId) {
      property = await homestaysCollection.findOne({
        _id: new ObjectId(booking.homestayId),
      });
      propertyCollection = "homestays";
    }

    await client.close();

    return NextResponse.json({
      booking: {
        _id: booking._id,
        guestName: booking.guestName,
        hotelId: booking.hotelId,
        homestayId: booking.homestayId,
        ownerId: booking.ownerId,
        bookingStatus: booking.bookingStatus,
      },
      property: property
        ? {
            _id: property._id,
            collection: propertyCollection,
            name: property.name,
            propertyName: property.propertyName,
            hotelName: property.hotelName,
            roomType: property.roomType,
            room_type: property.room_type,
            amenities: property.amenities,
            facilities: property.facilities,
            city: property.city,
            destination: property.destination,
            address: property.address,
            location: property.location,
            street: property.street,
            price: property.price,
            pricePerNight: property.pricePerNight,
            bedrooms: property.bedrooms,
            beds: property.beds,
            bathrooms: property.bathrooms,
            baths: property.baths,
            image: property.image,
            images: property.images ? property.images.slice(0, 2) : undefined,
            thumbnail: property.thumbnail,
          }
        : null,
    });
  } catch (error) {
    console.error("[Debug] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
