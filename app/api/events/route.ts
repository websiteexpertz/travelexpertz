import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

const SAMPLE_EVENTS = [
  {
    _id: "evt_bundi_fest",
    eventName: "Bundi Festival",
    description: "A grand celebration of Rajasthani culture, folk arts, fireworks, and heritage traditions.",
    location: "Bundi, Rajasthan",
    state: "Rajasthan",
    city: "Bundi",
    locations: [{ city: "Bundi", state: "Rajasthan" }],
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: "/hero4.jpeg",
    galleryImages: ["/hero4.jpeg"],
    organizer: "Rajasthan Tourism",
    category: "Cultural",
    ticketPrice: 500,
    registrationLink: "",
    active: true,
  },
  {
    _id: "evt_pushkar_fair",
    eventName: "Pushkar Camel Fair",
    description: "One of India's largest and most famous cultural and livestock gatherings beside holy Pushkar Lake.",
    location: "Pushkar, Rajasthan",
    state: "Rajasthan",
    city: "Pushkar",
    locations: [{ city: "Pushkar", state: "Rajasthan" }],
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: "/hero2.jpeg",
    galleryImages: ["/hero2.jpeg"],
    organizer: "Pushkar Mela Committee",
    category: "Festival",
    ticketPrice: 0,
    registrationLink: "",
    active: true,
  },
  {
    _id: "evt_multicity_fest",
    eventName: "Multi-City Cultural Festival",
    description: "A synchronized cultural showcase celebrating music, arts, and culinary traditions across multiple vibrant states.",
    location: "Multiple Cities, India",
    state: "Rajasthan",
    city: "Jaipur",
    locations: [
      { city: "Jaipur", state: "Rajasthan" },
      { city: "Udaipur", state: "Rajasthan" },
      { city: "Dehradun", state: "Uttarakhand" },
      { city: "Lucknow", state: "Uttar Pradesh" },
    ],
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: "/hero1.jpeg",
    galleryImages: ["/hero1.jpeg"],
    organizer: "National Cultural Guild",
    category: "Cultural",
    ticketPrice: 750,
    registrationLink: "",
    active: true,
  },
  {
    _id: "evt_goa_carnival",
    eventName: "Goa Carnival",
    description: "Vibrant street parades, music, floats, and masquerades welcoming visitors along Goa's sun-drenched coast.",
    location: "Panaji, Goa",
    state: "Goa",
    city: "Panaji",
    locations: [{ city: "Panaji", state: "Goa" }],
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: "/hero3.jpeg",
    galleryImages: ["/hero3.jpeg"],
    organizer: "Goa Tourism",
    category: "Festival",
    ticketPrice: 0,
    registrationLink: "",
    active: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";
    const eventId = searchParams.get("id");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : null;

    const db = await getDb(MONGODB_DB);
    const eventsCollection = db.collection("events");

    if (eventId) {
      let event = null;
      try {
        event = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });
      } catch {
        // Fallback or string ID
        event = await eventsCollection.findOne({ _id: eventId as any });
      }
      if (!event) {
        const sample = SAMPLE_EVENTS.find((e) => e._id === eventId);
        if (sample) return NextResponse.json(sample);
      }
      return NextResponse.json(event || null);
    }

    const query = admin ? {} : { active: true };
    let cursor = eventsCollection.find(query).sort({ startDate: 1 });
    if (limit && limit > 0) {
      cursor = cursor.limit(limit);
    }
    const events = await cursor.toArray();

    if (events.length === 0 && !admin) {
      const fallback = limit ? SAMPLE_EVENTS.slice(0, limit) : SAMPLE_EVENTS;
      return NextResponse.json(fallback, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    return NextResponse.json(events, {
      headers: {
        "Cache-Control": admin
          ? "no-store"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(SAMPLE_EVENTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb(MONGODB_DB);
    const eventsCollection = db.collection("events");

    const rawLocations = Array.isArray(body.locations) ? body.locations : [];
    const locations = rawLocations
      .map((loc: any) => ({
        city: typeof loc.city === "string" ? loc.city.trim() : "",
        state: typeof loc.state === "string" ? loc.state.trim() : "",
      }))
      .filter((loc: any) => loc.city || loc.state);

    const eventData = {
      eventName: body.eventName,
      description: body.description,
      location: body.location,
      state: body.state || locations[0]?.state || "",
      city: body.city || locations[0]?.city || "",
      locations:
        locations.length > 0
          ? locations
          : body.state
          ? [{ state: body.state, city: body.city || "" }]
          : [],
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      profileImage: body.profileImage,
      galleryImages: body.galleryImages || [],
      organizer: body.organizer,
      category: body.category,
      ticketPrice: body.ticketPrice,
      registrationLink: body.registrationLink,
      active: body.active !== undefined ? body.active : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await eventsCollection.insertOne(eventData);

    return NextResponse.json(
      { _id: result.insertedId, ...eventData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects if they exist
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    if (updateData.locations && Array.isArray(updateData.locations)) {
      updateData.locations = updateData.locations
        .map((loc: any) => ({
          city: typeof loc.city === "string" ? loc.city.trim() : "",
          state: typeof loc.state === "string" ? loc.state.trim() : "",
        }))
        .filter((loc: any) => loc.city || loc.state);
      if (!updateData.state && updateData.locations[0]?.state) {
        updateData.state = updateData.locations[0].state;
      }
      if (!updateData.city && updateData.locations[0]?.city) {
        updateData.city = updateData.locations[0].city;
      }
    }

    const db = await getDb(MONGODB_DB);
    const eventsCollection = db.collection("events");

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb(MONGODB_DB);
    const eventsCollection = db.collection("events");

    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(eventId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
