import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// Levenshtein distance for spell correction
function getLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured", locations: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const id = searchParams.get("id");

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    
    // If ID is provided, fetch single location
    if (id) {
      const locationsCollection = db.collection("locations");
      const location = await locationsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }

      return NextResponse.json(location);
    }

    // Fetch from both sources: hotel_destination_states (where admins add states/cities) and hotel_destinations (legacy)
    const locationsCollection = db.collection("locations");
    const hotelDestinationStatesCollection = db.collection("hotel_destination_states");
    const hotelDestinationsCollection = db.collection("hotel_destinations");
    const hotelsCollection = db.collection("hotels");

    // Fetch all collections in parallel for faster performance
    const [explicitLocations, hotelDestinationStates, hotelDestinations, hotels] = await Promise.all([
      locationsCollection
        .find({ active: { $ne: false } })
        .project({ name: 1, _id: 1, active: 1, source: 1, type: 1 })
        .toArray(),
      hotelDestinationStatesCollection
        .find({})
        .project({ stateName: 1, cityName: 1, _id: 1 })
        .toArray(),
      hotelDestinationsCollection
        .find({})
        .project({ stateName: 1, cityName: 1, _id: 1 })
        .toArray(),
      hotelsCollection
        .find({ active: { $ne: false } })
        .project({ name: 1, location: 1, city: 1, state: 1, _id: 1 })
        .toArray(),
    ]);

    console.log("Explicit locations from collection:", explicitLocations.length);
    console.log("Total hotel_destination_states documents:", hotelDestinationStates.length);
    console.log("Total active hotels:", hotels.length);

    // Get unique states AND cities from both sources
    const statesMap = new Map<string, any>();
    const citiesMap = new Map<string, any>();
    const hotelNamesMap = new Map<string, any>();

    // Process hotel_destination_states (this is the primary source from "Manage States & Cities")
    for (const dest of hotelDestinationStates) {
      if (dest.stateName) {
        const stateKey = dest.stateName.toLowerCase();
        if (!statesMap.has(stateKey)) {
          statesMap.set(stateKey, {
            _id: new ObjectId(),
            name: dest.stateName,
            source: 'hotel_destination_states',
            active: true,
            type: 'state'
          });
        }
      }

      if (dest.cityName) {
        const cityKey = dest.cityName.toLowerCase();
        if (!citiesMap.has(cityKey)) {
          citiesMap.set(cityKey, {
            _id: new ObjectId(),
            name: dest.cityName,
            state: dest.stateName,
            source: 'hotel_destination_states',
            active: true,
            type: 'city'
          });
        }
      }
    }

    // Also process hotel_destinations as fallback (for legacy data)
    for (const dest of hotelDestinations) {
      if (dest.stateName) {
        const stateKey = dest.stateName.toLowerCase();
        if (!statesMap.has(stateKey)) {
          statesMap.set(stateKey, {
            _id: new ObjectId(),
            name: dest.stateName,
            hotelDestinationId: dest._id,
            source: 'hotel_destinations',
            active: true,
            type: 'state'
          });
        }
      }

      if (dest.cityName) {
        const cityKey = dest.cityName.toLowerCase();
        if (!citiesMap.has(cityKey)) {
          citiesMap.set(cityKey, {
            _id: new ObjectId(),
            name: dest.cityName,
            state: dest.stateName,
            hotelDestinationId: dest._id,
            source: 'hotel_destinations',
            active: true,
            type: 'city'
          });
        }
      }
    }

    // Process hotels - extract hotel names
    for (const hotel of hotels) {
      if (hotel.name) {
        const hotelKey = hotel.name.toLowerCase();
        if (!hotelNamesMap.has(hotelKey)) {
          hotelNamesMap.set(hotelKey, {
            _id: hotel._id,
            name: hotel.name,
            location: hotel.location || "",
            city: hotel.city || "",
            state: hotel.state || "",
            hotelId: hotel._id,
            source: 'hotels',
            active: true,
            type: 'hotel'
          });
        }
      }
    }

    // Convert maps to arrays
    const hotelStateLocations = Array.from(statesMap.values());
    const hotelCityLocations = Array.from(citiesMap.values());
    const hotelNameLocations = Array.from(hotelNamesMap.values());

    console.log("Unique states:", hotelStateLocations.length);
    console.log("Unique cities:", hotelCityLocations.length);
    console.log("Hotel names:", hotelNameLocations.length);

    // Merge: prioritize explicit locations but add states, cities, and hotels not already present
    const existingNames = new Set(explicitLocations.map((l: any) => l.name.toLowerCase()));
    const mergedLocations = [...explicitLocations];

    // Add states
    for (const stateLoc of hotelStateLocations) {
      if (!existingNames.has(stateLoc.name.toLowerCase())) {
        mergedLocations.push(stateLoc);
        existingNames.add(stateLoc.name.toLowerCase());
      }
    }

    // Add cities
    for (const cityLoc of hotelCityLocations) {
      if (!existingNames.has(cityLoc.name.toLowerCase())) {
        mergedLocations.push(cityLoc);
        existingNames.add(cityLoc.name.toLowerCase());
      }
    }

    // Add hotel names
    for (const hotelLoc of hotelNameLocations) {
      if (!existingNames.has(hotelLoc.name.toLowerCase())) {
        mergedLocations.push(hotelLoc);
        existingNames.add(hotelLoc.name.toLowerCase());
      }
    }

    console.log("Total merged locations:", mergedLocations.length);

    let locations = mergedLocations;

    // Apply smart search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      const searchLen = searchLower.length;
      const results: any[] = [];
      
      // Stage 1: Exact matches and starts-with (fastest)
      for (const loc of locations) {
        const locNameLower = loc.name.toLowerCase();
        if (locNameLower === searchLower) {
          results.push({ ...loc, score: 1 });
        } else if (locNameLower.startsWith(searchLower)) {
          results.push({ ...loc, score: 10 + (locNameLower.length - searchLen) });
        }
      }

      // Stage 2: Substring matches (medium speed)
      if (results.length < 15) {
        for (const loc of locations) {
          const locNameLower = loc.name.toLowerCase();
          if (!locNameLower.includes(searchLower) || locNameLower === searchLower || locNameLower.startsWith(searchLower)) {
            continue; // Skip already added
          }
          results.push({ ...loc, score: 100 + locNameLower.indexOf(searchLower) });
        }
      }

      // Stage 3: Fuzzy match with Levenshtein only if needed (expensive, minimal use)
      if (results.length < 15) {
        const fuzzyMatches: any[] = [];
        for (const loc of locations) {
          const locNameLower = loc.name.toLowerCase();
          // Check if already added
          const alreadyAdded = results.some(r => r.name === loc.name);
          if (alreadyAdded) continue;

          const distance = getLevenshteinDistance(searchLower, locNameLower);
          // More strict threshold - only 2 characters different
          if (distance <= 2) {
            fuzzyMatches.push({ ...loc, score: 200 + distance });
          }
        }
        results.push(...fuzzyMatches);
      }

      // Sort by score and limit to top 15
      locations = results
        .sort((a, b) => a.score - b.score)
        .slice(0, 15)
        .map(({ score, ...loc }) => loc); // Remove score before returning
    }

    console.log("Returning locations count:", locations.length);
    return NextResponse.json(locations);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching locations:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch locations", details: errorMessage, locations: [] },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    // Check if location with same name already exists
    const existingLocation = await locationsCollection.findOne({
      name: { $regex: `^${body.name}$`, $options: "i" },
    });

    if (existingLocation) {
      return NextResponse.json(
        { _id: existingLocation._id, ...existingLocation },
        { status: 200 }
      );
    }

    const now = new Date();
    const result = await locationsCollection.insertOne({
      ...body,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PATCH(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 });
    }

    const { id: _id1, _id: _id2, ...updateData } = body;

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    const result = await locationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    const result = await locationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
