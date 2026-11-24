import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// Module-level in-memory cache for locations and destinations
let cachedLocations: LocationEntry[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

type PhotonFeature = {
  properties?: {
    osm_id?: number;
    osm_type?: string;
    osm_value?: string;
    name?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    street?: string;
  };
};

type LocationRecord = {
  _id: ObjectId;
  name: string;
  active?: boolean;
  source?: string;
  type?: string;
  area?: string;
  state?: string;
  location?: string;
  city?: string;
  stateName?: string;
  cityName?: string;
  address?: string;
  hotelDestinationId?: ObjectId;
  hotelId?: ObjectId;
  staysCount?: number;
};

type LocationEntry = Omit<LocationRecord, "_id"> & {
  _id: ObjectId | string;
  country?: string;
  displayName?: string;
  staysCount?: number;
};

type DestinationRecord = {
  _id: ObjectId;
  stateName?: string;
  cityName?: string;
};

type HotelRecord = {
  _id: ObjectId;
  name?: string;
  location?: string;
  city?: string;
  state?: string;
  address?: string;
  active?: boolean;
};

// Seed / Popular Indian Travel Destinations & Key Areas
// Guarantees searches for major destinations (Dehradun, Udaipur, etc.) and their key areas always return
// the exact "Area - City - State - Country" hierarchy.
const POPULAR_DESTINATIONS: LocationEntry[] = [
  // Major Destinations
  {
    _id: "seed:city:dehradun",
    name: "Dehradun",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "city",
    displayName: "Dehradun, Uttarakhand, India",
    staysCount: 12,
  },
  {
    _id: "seed:city:mussoorie",
    name: "Mussoorie",
    city: "Mussoorie",
    state: "Uttarakhand",
    country: "India",
    type: "city",
    displayName: "Mussoorie, Uttarakhand, India",
    staysCount: 8,
  },
  {
    _id: "seed:city:rishikesh",
    name: "Rishikesh",
    city: "Rishikesh",
    state: "Uttarakhand",
    country: "India",
    type: "city",
    displayName: "Rishikesh, Uttarakhand, India",
    staysCount: 15,
  },
  {
    _id: "seed:city:haridwar",
    name: "Haridwar",
    city: "Haridwar",
    state: "Uttarakhand",
    country: "India",
    type: "city",
    displayName: "Haridwar, Uttarakhand, India",
    staysCount: 6,
  },
  {
    _id: "seed:city:nainital",
    name: "Nainital",
    city: "Nainital",
    state: "Uttarakhand",
    country: "India",
    type: "city",
    displayName: "Nainital, Uttarakhand, India",
    staysCount: 7,
  },
  {
    _id: "seed:city:udaipur",
    name: "Udaipur",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    type: "city",
    displayName: "Udaipur, Rajasthan, India",
    staysCount: 9,
  },
  {
    _id: "seed:city:jaipur",
    name: "Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    type: "city",
    displayName: "Jaipur, Rajasthan, India",
    staysCount: 14,
  },
  {
    _id: "seed:city:delhi",
    name: "Delhi",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    type: "city",
    displayName: "Delhi, Delhi, India",
    staysCount: 18,
  },
  {
    _id: "seed:city:goa",
    name: "Goa",
    city: "Goa",
    state: "Goa",
    country: "India",
    type: "city",
    displayName: "Goa, Goa, India",
    staysCount: 22,
  },
  {
    _id: "seed:city:manali",
    name: "Manali",
    city: "Manali",
    state: "Himachal Pradesh",
    country: "India",
    type: "city",
    displayName: "Manali, Himachal Pradesh, India",
    staysCount: 11,
  },
  {
    _id: "seed:city:shimla",
    name: "Shimla",
    city: "Shimla",
    state: "Himachal Pradesh",
    country: "India",
    type: "city",
    displayName: "Shimla, Himachal Pradesh, India",
    staysCount: 10,
  },

  // Dehradun Key Areas: Area - City - State - Country
  {
    _id: "seed:area:it-park-dehradun",
    name: "IT-Park",
    area: "IT-Park",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "IT-Park, Dehradun, Uttarakhand, India",
    staysCount: 3,
  },
  {
    _id: "seed:area:rajpur-road-dehradun",
    name: "Rajpur Road",
    area: "Rajpur Road",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Rajpur Road, Dehradun, Uttarakhand, India",
    staysCount: 5,
  },
  {
    _id: "seed:area:jakhan-dehradun",
    name: "Jakhan",
    area: "Jakhan",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Jakhan, Dehradun, Uttarakhand, India",
    staysCount: 2,
  },
  {
    _id: "seed:area:prem-nagar-dehradun",
    name: "Prem Nagar",
    area: "Prem Nagar",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Prem Nagar, Dehradun, Uttarakhand, India",
    staysCount: 2,
  },
  {
    _id: "seed:area:sahastradhara-road-dehradun",
    name: "Sahastradhara Road",
    area: "Sahastradhara Road",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Sahastradhara Road, Dehradun, Uttarakhand, India",
    staysCount: 4,
  },
  {
    _id: "seed:area:clock-tower-dehradun",
    name: "Clock Tower",
    area: "Clock Tower",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Clock Tower, Dehradun, Uttarakhand, India",
    staysCount: 3,
  },
  {
    _id: "seed:area:paltan-bazaar-dehradun",
    name: "Paltan Bazaar",
    area: "Paltan Bazaar",
    city: "Dehradun",
    state: "Uttarakhand",
    country: "India",
    type: "area",
    displayName: "Paltan Bazaar, Dehradun, Uttarakhand, India",
    staysCount: 2,
  },

  // Udaipur Key Areas & Properties (Matching user reference image)
  {
    _id: "seed:area:lake-pichola-udaipur",
    name: "Lake Pichola",
    area: "Lake Pichola",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    type: "area",
    displayName: "Lake Pichola, Udaipur, Rajasthan, India",
    staysCount: 4,
  },
  {
    _id: "seed:area:fateh-sagar-udaipur",
    name: "Fateh Sagar Lake",
    area: "Fateh Sagar Lake",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    type: "area",
    displayName: "Fateh Sagar Lake, Udaipur, Rajasthan, India",
    staysCount: 3,
  },
  {
    _id: "seed:prop:oberoi-udaivilas",
    name: "The Oberoi Udaivilas Palace",
    area: "Lake Pichola",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    type: "hotel",
    displayName: "The Oberoi Udaivilas Palace, Lake Pichola, Udaipur, Rajasthan, India",
  },
  {
    _id: "seed:prop:heritage-place",
    name: "heritage Place",
    area: "Old City",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    type: "homestay",
    displayName: "heritage Place, Udaipur, Rajasthan, India",
  },
];

async function searchPhotonLocations(search: string) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", search);
  url.searchParams.set("limit", "15");
  url.searchParams.set("lang", "en");
  url.searchParams.set("lat", "22.5");
  url.searchParams.set("lon", "79");
  url.searchParams.set("zoom", "4");
  url.searchParams.set("bbox", "68.1,6.5,97.4,37.1");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(800),
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Location provider returned ${response.status}`);
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const searchLower = search.trim().toLocaleLowerCase();
  const seen = new Set<string>();
  const results = (data.features ?? [])
    .map((feature) => feature.properties)
    .filter(
      (location): location is NonNullable<PhotonFeature["properties"]> & {
        name: string;
        country: string;
      } =>
        Boolean(
          location?.name &&
            location.country?.toLocaleLowerCase() === "india",
        ),
    )
    .map((location) => {
      const name = (location.name || "").trim();
      const locality = (location.locality || location.street || "").trim();
      const city = (location.city || location.district || "").trim();
      const state = (location.state || "").trim();
      const country = (location.country || "India").trim();

      const nameLower = name.toLowerCase();
      const isCity = Boolean(city && city.toLowerCase() === nameLower);

      // Build flow: [Area (if different), City (if different), State, Country]
      const contextParts: string[] = [];
      if (locality && locality.toLowerCase() !== nameLower && !contextParts.some((p) => p.toLowerCase() === locality.toLowerCase())) {
        contextParts.push(locality);
      }
      if (city && city.toLowerCase() !== nameLower && !contextParts.some((p) => p.toLowerCase() === city.toLowerCase())) {
        contextParts.push(city);
      }
      if (state && state.toLowerCase() !== nameLower && !contextParts.some((p) => p.toLowerCase() === state.toLowerCase())) {
        contextParts.push(state);
      }
      if (country && country.toLowerCase() !== nameLower && !contextParts.some((p) => p.toLowerCase() === country.toLowerCase())) {
        contextParts.push(country);
      }

      const displayName = [name, ...contextParts].join(", ");

      return {
        suggestion: {
          _id: `osm:${location.osm_type ?? "place"}:${location.osm_id ?? displayName}`,
          name,
          displayName,
          area: !isCity ? locality || name : "",
          location: contextParts.join(", "),
          city: isCity ? name : city,
          state,
          country,
          source: "photon",
          type: isCity ? "city" : "area",
        },
        score:
          nameLower === searchLower
            ? 0
            : nameLower.startsWith(searchLower)
              ? 1
              : 2,
      };
    })
    .sort((first, second) => first.score - second.score)
    .filter((result) => {
      const key = result.suggestion.displayName.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 15)
    .map((result) => result.suggestion);

  return results;
}

async function getAllLocations(): Promise<LocationEntry[]> {
  if (cachedLocations && Date.now() < cacheExpiry) {
    return cachedLocations;
  }

  try {
    const db = await getDb(MONGODB_DB);
    const locationsCollection = db.collection<LocationRecord>("locations");
    const hotelDestinationStatesCollection = db.collection<DestinationRecord>("hotel_destination_states");
    const hotelDestinationsCollection = db.collection<DestinationRecord>("hotel_destinations");
    const hotelsCollection = db.collection<HotelRecord>("hotels");
    const homestaysCollection = db.collection<any>("homestays");

    const [explicitLocations, hotelDestinationStates, hotelDestinations, hotels, homestays] = await Promise.all([
      locationsCollection.find({ active: { $ne: false } }).toArray().catch(() => []),
      hotelDestinationStatesCollection.find({}).toArray().catch(() => []),
      hotelDestinationsCollection.find({}).toArray().catch(() => []),
      hotelsCollection.find({ active: { $ne: false } }).toArray().catch(() => []),
      homestaysCollection.find({ active: { $ne: false } }).toArray().catch(() => []),
    ]);

    const statesMap = new Map<string, LocationEntry>();
    const citiesMap = new Map<string, LocationEntry>();
    const areasMap = new Map<string, LocationEntry>();
    const propertiesMap = new Map<string, LocationEntry>();

    // 1. Process Destination States & Cities
    for (const dest of [...hotelDestinationStates, ...hotelDestinations]) {
      if (dest.stateName) {
        const stateKey = dest.stateName.toLowerCase().trim();
        if (!statesMap.has(stateKey)) {
          statesMap.set(stateKey, {
            _id: dest._id || new ObjectId(),
            name: dest.stateName,
            state: dest.stateName,
            country: "India",
            type: "state",
            displayName: dest.stateName + ", India",
          });
        }
      }
      if (dest.cityName) {
        const cityKey = dest.cityName.toLowerCase().trim();
        if (!citiesMap.has(cityKey)) {
          const state = dest.stateName || "";
          citiesMap.set(cityKey, {
            _id: dest._id || new ObjectId(),
            name: dest.cityName,
            city: dest.cityName,
            state,
            country: "India",
            type: "city",
            displayName: dest.cityName + (state ? ", " + state : "") + ", India",
          });
        }
      }
    }

    // 2. Process Hotels & Homestays (extract properties and their areas)
    for (const item of [...hotels, ...homestays]) {
      const itemCity = (item.city || "").trim();
      const itemState = (item.state || "").trim();
      const itemArea = (item.location || "").trim();
      const isHomestay = Boolean(item.propertyType || item.hostName);

      // Add property itself
      if (item.name) {
        const propKey = item.name.toLowerCase().trim();
        if (!propertiesMap.has(propKey)) {
          const flowParts = [itemArea, itemCity, itemState, "India"].filter(Boolean);
          propertiesMap.set(propKey, {
            _id: item._id,
            name: item.name,
            area: itemArea,
            city: itemCity,
            state: itemState,
            country: "India",
            type: isHomestay ? "homestay" : "hotel",
            displayName: item.name + (flowParts.length ? ", " + flowParts.join(", ") : ""),
          });
        }
      }

      // Add area: Area - City - State - Country
      if (itemArea && itemCity) {
        const areaKey = (itemArea + "-" + itemCity).toLowerCase();
        if (!areasMap.has(areaKey)) {
          const flowParts = [itemCity, itemState, "India"].filter(Boolean);
          areasMap.set(areaKey, {
            _id: new ObjectId(),
            name: itemArea,
            area: itemArea,
            city: itemCity,
            state: itemState,
            country: "India",
            type: "area",
            displayName: itemArea + ", " + flowParts.join(", "),
          });
        }
      }

      // Add city if missing
      if (itemCity) {
        const cityKey = itemCity.toLowerCase();
        if (!citiesMap.has(cityKey)) {
          citiesMap.set(cityKey, {
            _id: new ObjectId(),
            name: itemCity,
            city: itemCity,
            state: itemState,
            country: "India",
            type: "city",
            displayName: itemCity + (itemState ? ", " + itemState : "") + ", India",
          });
        }
      }
    }

    const explicitList: LocationEntry[] = explicitLocations.map((loc: any) => ({
      _id: loc._id,
      name: loc.name,
      displayName: loc.displayName || loc.name,
      area: loc.area || "",
      city: loc.city || "",
      state: loc.state || "",
      country: loc.country || "India",
      type: (loc.type || "city") as any,
    }));

    cachedLocations = [
      ...Array.from(citiesMap.values()),
      ...Array.from(areasMap.values()),
      ...Array.from(propertiesMap.values()),
      ...Array.from(statesMap.values()),
      ...explicitList,
      ...POPULAR_DESTINATIONS,
    ];
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return cachedLocations;
  } catch (err) {
    console.error("Error loading locations from DB, falling back to popular destinations:", err);
    return POPULAR_DESTINATIONS;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const id = searchParams.get("id");
    const providerOnly = searchParams.get("source") === "photon";

    if (id) {
      const db = await getDb(MONGODB_DB);
      const locationsCollection = db.collection<LocationRecord>("locations");
      const location = await locationsCollection.findOne({ _id: new ObjectId(id) });
      if (location) return NextResponse.json(location);
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    if (providerOnly) {
      try {
        const photonResults = await searchPhotonLocations(search);
        return NextResponse.json(photonResults);
      } catch {
        return NextResponse.json([], { status: 200 });
      }
    }

    // If search is empty, return empty list (do not show suggestions without typing)
    if (!search) {
      return NextResponse.json([]);
    }

    // In-memory lookup: < 1ms response
    const allLocations = await getAllLocations();
    const searchLower = search.toLowerCase().trim();
    const scored: Array<LocationEntry & { score: number }> = [];

    for (const loc of allLocations) {
      const nameLower = (loc.name || "").toLowerCase();
      const areaLower = (loc.area || loc.location || "").toLowerCase();
      const cityLower = (loc.city || "").toLowerCase();
      const stateLower = (loc.state || "").toLowerCase();
      const displayLower = (loc.displayName || "").toLowerCase();

      // 1. Exact match on city, area, or name
      if (cityLower === searchLower || nameLower === searchLower || areaLower === searchLower) {
        scored.push({ ...loc, score: 1 });
      }
      // 2. Starts-with on city, area, or name
      else if (cityLower.startsWith(searchLower) || nameLower.startsWith(searchLower) || areaLower.startsWith(searchLower)) {
        scored.push({ ...loc, score: 10 });
      }
      // 3. Substring in city, area, or name
      else if (cityLower.includes(searchLower) || areaLower.includes(searchLower) || nameLower.includes(searchLower)) {
        scored.push({ ...loc, score: 50 });
      }
      // 4. Substring in full display hierarchy
      else if (displayLower.includes(searchLower) || stateLower.includes(searchLower)) {
        scored.push({ ...loc, score: 100 });
      }
    }

    scored.sort((a, b) => a.score - b.score);

    const seen = new Set<string>();
    const deduplicated = scored.filter((loc) => {
      const key = (loc.displayName || `${loc.name}, ${loc.city || ""}, ${loc.state || ""}`).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // If we have at least 5 good matches from DB & popular destinations, return immediately without waiting for Photon!
    if (deduplicated.length >= 5) {
      return NextResponse.json(deduplicated.slice(0, 15), {
        headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
      });
    }

    // Otherwise, fast-query Photon with 800ms timeout
    let providerLocations: LocationEntry[] = [];
    try {
      providerLocations = await searchPhotonLocations(search);
    } catch {
      // Ignore photon timeout
    }

    const combined = [...deduplicated, ...providerLocations]
      .filter((loc) => {
        const key = (loc.displayName || `${loc.name}, ${loc.city || ""}, ${loc.state || ""}`).toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 15);

    return NextResponse.json(combined, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Error in locations API:", error);
    return NextResponse.json(POPULAR_DESTINATIONS.slice(0, 10));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    const existingLocation = await locationsCollection.findOne({
      name: { $regex: `^${body.name}$`, $options: "i" },
    });

    if (existingLocation) {
      return NextResponse.json(existingLocation, { status: 200 });
    }

    const now = new Date();
    const result = await locationsCollection.insertOne({
      ...body,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    // Invalidate in-memory cache
    cachedLocations = null;

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 });
    }

    const updateData = { ...body };
    delete updateData.id;
    delete updateData._id;

    const db = await getDb(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    const result = await locationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Invalidate in-memory cache
    cachedLocations = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 });
    }

    const db = await getDb(MONGODB_DB);
    const locationsCollection = db.collection("locations");

    const result = await locationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Invalidate in-memory cache
    cachedLocations = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
