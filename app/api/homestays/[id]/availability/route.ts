import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// Normalize date to YYYY-MM-DD
function toDateStr(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") {
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

// Generate all dates in [checkin, checkout) range (check-in inclusive, checkout-exclusive)
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
    const homestayId = params?.id;

    if (!homestayId || !ObjectId.isValid(homestayId)) {
      return NextResponse.json({ error: "Invalid homestay ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const requestedRoomId = searchParams.get("roomId");

    const db = await getDb();
    const homestaysCollection = db.collection("homestays");
    const ownerPropertiesCollection = db.collection("ownerproperties");
    const bookingsCollection = db.collection("bookings");

    // 1. Fetch homestay document
    let homestay: any = await homestaysCollection.findOne({ _id: new ObjectId(homestayId) });
    if (!homestay) {
      homestay = await ownerPropertiesCollection.findOne({ _id: new ObjectId(homestayId) });
    }

    if (!homestay) {
      return NextResponse.json({ error: "Homestay not found" }, { status: 404 });
    }

    // 2. Identify available rooms and selected room
    const rooms = Array.isArray(homestay.rooms) ? homestay.rooms : [];
    let targetRoom = requestedRoomId
      ? rooms.find((r: any) => String(r.id) === String(requestedRoomId))
      : rooms[0] || null;

    if (!targetRoom && rooms.length > 0) {
      targetRoom = rooms[0];
    }

    const nightlyPrice = Number(targetRoom?.price ?? homestay.price ?? 2500);
    const totalInventory = Number(targetRoom?.availability ?? (rooms.length > 0 ? 5 : 1));

    // 3. Fetch active bookings
    const bookings = await bookingsCollection
      .find({
        $or: [
          { homestayId: new ObjectId(homestayId) },
          { homestayId: homestayId },
          { hotelId: new ObjectId(homestayId) },
          { hotelId: homestayId },
        ],
        bookingStatus: { $in: ["confirmed", "pending", "completed"] },
      })
      .toArray();

    // 4. Map occupancy per date
    const occupancyByDate: Record<string, number> = {};

    for (const b of bookings) {
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

    // 5. Blocked dates
    const blockedDatesSet = new Set<string>();
    if (Array.isArray(homestay.blockedDates)) {
      homestay.blockedDates.forEach((d: any) => {
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

    // 6. Build bookedDates
    const bookedDates: string[] = Array.from(blockedDatesSet);
    for (const [dateStr, occupied] of Object.entries(occupancyByDate)) {
      if (occupied >= totalInventory) {
        if (!blockedDatesSet.has(dateStr)) {
          bookedDates.push(dateStr);
        }
      }
    }

    bookedDates.sort();

    return NextResponse.json({
      success: true,
      homestayId,
      homestayName: homestay.name || homestay.propertyName || "Homestay",
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
    console.error("Homestay availability API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch property availability", details: error?.message },
      { status: 500 }
    );
  }
}
