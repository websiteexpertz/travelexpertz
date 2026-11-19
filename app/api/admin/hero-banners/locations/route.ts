import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const selectedState = searchParams.get("state")?.trim() || "";
    const db = await getDb();

    // 1. Get countries
    const destinations = await db
      .collection("hotel_destinations")
      .find({})
      .project({ country: 1, stateName: 1, state: 1, cityName: 1 })
      .toArray();

    const countrySet = new Set<string>(["India"]);
    destinations.forEach((d: any) => {
      if (d.country && typeof d.country === "string") {
        countrySet.add(d.country.trim());
      }
    });

    // 2. Get states from hotel_destination_states and hotel_destinations
    const statesFromDb = await db
      .collection("hotel_destination_states")
      .find({})
      .project({ stateName: 1 })
      .toArray();

    const stateSet = new Set<string>(DEFAULT_INDIAN_STATES);
    statesFromDb.forEach((s: any) => {
      if (s.stateName && typeof s.stateName === "string" && s.stateName.trim()) {
        stateSet.add(s.stateName.trim());
      }
    });

    destinations.forEach((d: any) => {
      const sName = d.stateName || d.state;
      if (sName && typeof sName === "string" && sName.trim()) {
        stateSet.add(sName.trim());
      }
    });

    const countries = Array.from(countrySet).sort().map((c) => ({
      id: c.toLowerCase().replace(/\s+/g, "-"),
      name: c,
    }));

    const states = Array.from(stateSet).sort().map((s) => ({
      id: s.toLowerCase().replace(/\s+/g, "-"),
      name: s,
      countryId: "india", // Primary association
    }));

    // 3. Get cities (optionally filtered by selectedState)
    const citySet = new Set<string>();
    const cities: any[] = [];

    destinations.forEach((d: any) => {
      const cName = d.cityName?.trim();
      const sName = (d.stateName || d.state || "").trim();
      if (!cName) return;

      if (!selectedState || sName.toLowerCase() === selectedState.toLowerCase()) {
        const key = cName.toLowerCase();
        if (!citySet.has(key)) {
          citySet.add(key);
          cities.push({
            id: d._id ? d._id.toString() : cName.toLowerCase().replace(/\s+/g, "-"),
            name: cName,
            stateName: sName,
            active: d.active !== false,
          });
        }
      }
    });

    // Default cities for Uttarakhand if none exist yet in DB
    if (selectedState && selectedState.toLowerCase() === "uttarakhand" && cities.length === 0) {
      ["Dehradun", "Mussoorie", "Rishikesh", "Nainital", "Haridwar", "Auli"].forEach((c) => {
        cities.push({
          id: c.toLowerCase().replace(/\s+/g, "-"),
          name: c,
          stateName: "Uttarakhand",
          active: true,
        });
      });
    }

    cities.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ countries, states, cities });
  } catch (error) {
    console.error("Error fetching locations for hero banners:", error);
    return NextResponse.json(
      {
        countries: [{ id: "india", name: "India" }],
        states: DEFAULT_INDIAN_STATES.map((s) => ({
          id: s.toLowerCase().replace(/\s+/g, "-"),
          name: s,
          countryId: "india",
        })),
      },
      { status: 200 }
    );
  }
}
