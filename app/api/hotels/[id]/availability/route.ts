import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// Helper to normalize any date input (Date object or string) to YYYY-MM-DD
function toDateStr(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") {
    // If it's already YYYY-MM-DD or starts with YYYY-MM-DD
    const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Generate all calendar date strings in [checkin, checkout) range (check-in inclusive, checkout-exclusive)
function getDateRangeExclusive(checkinStr: string, checkoutStr: string): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = checkinStr.split("-").map(Number);
  const [ey, em, ed] = checkoutStr.split("-").map(Number);

  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  while (cur < end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const hotelId = params?.id;

    if (!hotelId || !ObjectId.isValid(hotelId)) {
      return NextResponse.json({ error: "Invalid hotel ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const requestedRoomId = searchParams.get("roomId");

    const db = await getDb();
    const hotelsCollection = db.collection("hotels");
    const ownerPropertiesCollection = db.collection("ownerproperties");
    const bookingsCollection = db.collection("bookings");

    // 1. Fetch hotel/homestay document
    let hotel: any = await hotelsCollection.findOne({ _id: new ObjectId(hotelId) });
    if (!hotel) {
      hotel = await ownerPropertiesCollection.findOne({ _id: new ObjectId(hotelId) });
    }
    if (!hotel) {
      hotel = await db.collection("homestays").findOne({ _id: new ObjectId(hotelId) });
    }

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // 2. Identify available rooms and selected room
    const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
    let targetRoom = requestedRoomId
      ? rooms.find((r: any) => String(r.id) === String(requestedRoomId))
      : rooms[0] || null;

    if (!targetRoom && rooms.length > 0) {
      targetRoom = rooms[0];
    }

    // Default nightly price from target room or hotel level
    const nightlyPrice = Number(targetRoom?.price ?? hotel.price ?? 0);
    const totalInventory = Number(targetRoom?.availability ?? (rooms.length > 0 ? 5 : 1));

    // 3. Fetch all active bookings for this property
    const bookings = await bookingsCollection
      .find({
        $or: [
          { hotelId: new ObjectId(hotelId) },
          { hotelId: hotelId },
          { homestayId: new ObjectId(hotelId) },
          { homestayId: hotelId },
        ],
        bookingStatus: { $in: ["confirmed", "pending", "completed"] },
      })
      .toArray();

    // 4. Map bookings to occupancy counts per date
    // Check-in inclusive, check-out exclusive
    const occupancyByDate: Record<string, number> = {};

    for (const b of bookings) {
      // If a specific room is targeted, only count bookings for that room (or general bookings if roomId is missing)
      if (targetRoom && b.roomId && String(b.roomId) !== String(targetRoom.id)) {
        continue;
      }

      const inStr = toDateStr(b.checkin);
      const outStr = toDateStr(b.checkout);

      if (inStr && outStr && inStr < outStr) {
        const bookedDays = getDateRangeExclusive(inStr, outStr);
        const roomsBooked = Number(b.rooms ?? b.roomsCount ?? 1);

        for (const d of bookedDays) {
          occupancyByDate[d] = (occupancyByDate[d] || 0) + roomsBooked;
        }
      }
    }

    // 5. Check blocked dates on property or room level
    const blockedDatesSet = new Set<string>();
    if (Array.isArray(hotel.blockedDates)) {
      hotel.blockedDates.forEach((d: any) => {
        const s = toDateStr(d);
        if (s) blockedDatesSet.add(s);
      });
    }
    if (targetRoom && Array.isArray(targetRoom.blockedDates)) {
      targetRoom.blockedDates.forEach((d: any) => {
        const s = toDateStr(d);
        if (s) blockedDatesSet.add(s);
      });
    }

    // 6. Build bookedDates list
    const bookedDates: string[] = Array.from(blockedDatesSet);
    for (const [dateStr, occupied] of Object.entries(occupancyByDate)) {
      if (occupied >= totalInventory) {
        if (!blockedDatesSet.has(dateStr)) {
          bookedDates.push(dateStr);
        }
      }
    }

    // Sort booked dates
    bookedDates.sort();

    return NextResponse.json({
      success: true,
      hotelId,
      hotelName: hotel.name || hotel.propertyName || "Hotel",
      currency: "INR",
      roomId: targetRoom?.id || null,
      roomType: targetRoom?.type || null,
      nightlyPrice,
      totalInventory,
      bookedDates,
      occupancyByDate,
      rooms: rooms.map((r: any) => ({
        id: r.id,
        type: r.type,
        price: Number(r.price || 0),
        availability: Number(r.availability || 1),
      })),
    });
  } catch (error: any) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property availability", details: error?.message },
      { status: 500 }
    );
  }
}
