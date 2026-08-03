import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Check locations collection
    const locationsCollection = db.collection("locations");
    const locations = await locationsCollection.find({}).toArray();

    // Check hotel_destination_states collection (PRIMARY - where "Manage States & Cities" stores data)
    const hotelDestinationStatesCollection = db.collection("hotel_destination_states");
    const hotelDestStates = await hotelDestinationStatesCollection.find({}).toArray();

    // Check hotel_destinations collection (FALLBACK - legacy)
    const hotelDestCollection = db.collection("hotel_destinations");
    const hotelDests = await hotelDestCollection.find({}).toArray();

    // Extract all states and cities from hotel_destination_states
    const statesFromStatesCollection = hotelDestStates.map((d: any) => ({
      stateName: d.stateName,
      cityName: d.cityName,
      id: d._id,
    }));

    // Extract all states and cities from hotel_destinations
    const statesFromHotelDests = hotelDests.map((d: any) => ({
      stateName: d.stateName,
      cityName: d.cityName,
      id: d._id,
    }));

    // Simulate what locations API merges
    const statesSet = new Set<string>();
    const citiesSet = new Set<string>();
    const mergedList: any[] = [];

    // Process hotel_destination_states first (PRIMARY)
    for (const dest of hotelDestStates) {
      if (dest.stateName && !statesSet.has(dest.stateName)) {
        statesSet.add(dest.stateName);
        mergedList.push({
          name: dest.stateName,
          type: 'state',
          source: 'hotel_destination_states',
        });
      }
      if (dest.cityName && !citiesSet.has(dest.cityName)) {
        citiesSet.add(dest.cityName);
        mergedList.push({
          name: dest.cityName,
          type: 'city',
          state: dest.stateName,
          source: 'hotel_destination_states',
        });
      }
    }

    // Then process hotel_destinations (FALLBACK)
    for (const dest of hotelDests) {
      if (dest.stateName && !statesSet.has(dest.stateName)) {
        statesSet.add(dest.stateName);
        mergedList.push({
          name: dest.stateName,
          type: 'state',
          source: 'hotel_destinations',
        });
      }
      if (dest.cityName && !citiesSet.has(dest.cityName)) {
        citiesSet.add(dest.cityName);
        mergedList.push({
          name: dest.cityName,
          type: 'city',
          state: dest.stateName,
          source: 'hotel_destinations',
        });
      }
    }

    return NextResponse.json({
      locationsCount: locations.length,
      locations: locations.map((l: any) => ({ name: l.name, type: l.type })),
      hotelDestinationStatesCount: hotelDestStates.length,
      hotelDestinationStates: statesFromStatesCollection,
      hotelDestinationsCount: hotelDests.length,
      hotelDestinations: statesFromHotelDests,
      mergedLocations: mergedList,
      mergedLocationsCount: mergedList.length,
      uniqueStates: [...statesSet],
      uniqueCities: [...citiesSet],
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
