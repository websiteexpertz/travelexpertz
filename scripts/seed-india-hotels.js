const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

function readEnvValue(name, envContent) {
  const match = envContent.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, "m"));
  if (!match) return undefined;
  return match[1].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const MONGODB_URI = process.env.MONGODB_URI || readEnvValue("MONGODB_URI", envContent);
const MONGODB_DB = process.env.MONGODB_DB || readEnvValue("MONGODB_DB", envContent) || "travelexpertz";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in the environment or .env.local");
}

const destinations = [
  ["Jaipur", "Rajasthan", "Heritage", 4200],
  ["Udaipur", "Rajasthan", "Lakeside", 5200],
  ["Jodhpur", "Rajasthan", "Blue City", 3900],
  ["Jaisalmer", "Rajasthan", "Desert", 4600],
  ["Pushkar", "Rajasthan", "Garden", 3400],
  ["Agra", "Uttar Pradesh", "Taj View", 3600],
  ["Varanasi", "Uttar Pradesh", "Ghat View", 3300],
  ["Lucknow", "Uttar Pradesh", "Nawabi", 3700],
  ["Ayodhya", "Uttar Pradesh", "Sarayu", 3100],
  ["Mathura", "Uttar Pradesh", "Temple", 2800],
  ["New Delhi", "Delhi", "Capital", 5600],
  ["Mumbai", "Maharashtra", "Harbour", 6800],
  ["Pune", "Maharashtra", "Hillside", 4100],
  ["Nashik", "Maharashtra", "Vineyard", 3500],
  ["Lonavala", "Maharashtra", "Valley", 4300],
  ["Goa", "Goa", "Coconut Grove", 5900],
  ["Panaji", "Goa", "Mandovi", 4800],
  ["Gokarna", "Karnataka", "Coastal", 3600],
  ["Bengaluru", "Karnataka", "Garden City", 5100],
  ["Mysuru", "Karnataka", "Palace", 3500],
  ["Coorg", "Karnataka", "Coffee Estate", 4400],
  ["Hampi", "Karnataka", "Ruins", 3200],
  ["Kochi", "Kerala", "Harbour", 4700],
  ["Munnar", "Kerala", "Tea Garden", 5200],
  ["Alappuzha", "Kerala", "Backwater", 4500],
  ["Thiruvananthapuram", "Kerala", "Beachside", 3900],
  ["Kumarakom", "Kerala", "Lakeview", 5600],
  ["Chennai", "Tamil Nadu", "Marina", 4300],
  ["Ooty", "Tamil Nadu", "Hilltop", 4100],
  ["Madurai", "Tamil Nadu", "Temple City", 3000],
  ["Kodaikanal", "Tamil Nadu", "Pine Valley", 4400],
  ["Hyderabad", "Telangana", "Charminar", 4200],
  ["Visakhapatnam", "Andhra Pradesh", "Seaview", 3700],
  ["Kolkata", "West Bengal", "Heritage", 3900],
  ["Darjeeling", "West Bengal", "Himalayan", 4800],
  ["Shillong", "Meghalaya", "Cloud Valley", 3600],
  ["Guwahati", "Assam", "Brahmaputra", 3200],
  ["Bhubaneswar", "Odisha", "Temple Trail", 3100],
  ["Puri", "Odisha", "Sea Breeze", 3400],
  ["Shimla", "Himachal Pradesh", "Snowline", 4900],
  ["Manali", "Himachal Pradesh", "Pine Retreat", 5300],
  ["Dharamshala", "Himachal Pradesh", "Mountain View", 3900],
  ["Rishikesh", "Uttarakhand", "Ganga Retreat", 3700],
  ["Nainital", "Uttarakhand", "Lake Retreat", 4600],
  ["Mussoorie", "Uttarakhand", "Hillside", 4700],
  ["Srinagar", "Jammu and Kashmir", "Dal Lake", 5100],
  ["Leh", "Ladakh", "Highland", 5700],
  ["Gangtok", "Sikkim", "Mountain Breeze", 4400],
  ["Amritsar", "Punjab", "Golden Heritage", 3500],
  ["Ahmedabad", "Gujarat", "Sabarmati", 3600],
];

const imageUrls = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
];

const roomAmenities = [
  "Wi-Fi",
  "Air conditioning",
  "Room service",
  "Housekeeping",
  "Television",
  "Tea and coffee maker",
  "Charging points",
  "Work desk",
  "Wardrobe",
  "Hot and cold water",
  "Toiletries",
  "Safety locker",
];

const hotelAmenities = [
  "Free Wi-Fi",
  "24-hour front desk",
  "Housekeeping",
  "Restaurant",
  "Room service",
  "Air conditioning",
  "Parking",
  "Travel desk",
  "Laundry service",
  "Power backup",
  "Luggage storage",
  "CCTV security",
];

function createRoom(city, style, index, basePrice) {
  const types = ["Deluxe Room", "Premium Room", "Family Suite"];
  const views = ["Garden View", "Mountain View", "Valley View", "River View"];
  const multipliers = [1, 1.35, 1.8];
  const roomType = types[index];
  const price = Math.round(basePrice * multipliers[index] / 100) * 100;
  return {
    id: `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-room-${index + 1}`,
    type: roomType,
    price,
    originalPrice: Math.round(price * 1.2 / 100) * 100,
    maxGuests: index === 2 ? 4 : index === 1 ? 3 : 2,
    bedType: index === 2 ? "King Bed and Sofa Bed" : index === 1 ? "King Bed" : "Queen Bed",
    size: index === 2 ? 420 : index === 1 ? 290 : 220,
    amenities: roomAmenities.slice(0, 8 + index),
    images: [imageUrls[(index + 1) % imageUrls.length], imageUrls[(index + 3) % imageUrls.length]],
    availability: 5 + index * 2,
    cancellationPolicy: "Free cancellation up to 24 hours before check-in",
    mealPlan: index === 0 ? "Room Only" : index === 1 ? "Breakfast Included" : "Breakfast and Dinner Included",
    roomView: views[(city.length + index) % views.length],
  };
}

function createHotel([city, state, style, basePrice], index) {
  const slug = `${city}-${state}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rooms = [0, 1, 2].map((roomIndex) => createRoom(city, style, roomIndex, basePrice));
  return {
    seedKey: `india-hotel-${String(index + 1).padStart(2, "0")}`,
    name: `${style} ${city} Hotel`,
    location: `${city}, ${state}`,
    state,
    city,
    address: `Plot ${index + 1}, ${style} Road, ${city}, ${state}`,
    price: rooms[0].price,
    rating: Number((4.1 + (index % 9) / 10).toFixed(1)),
    reviews: 18 + index * 7,
    image: imageUrls[index % imageUrls.length],
    images: imageUrls.slice(0, 3).map((url, imageIndex) => `${url}&sig=${index}-${imageIndex}`),
    description: `${style} ${city} Hotel offers a comfortable base for exploring ${city}. Guests can enjoy thoughtful service, clean rooms, convenient local access, and a welcoming stay for business or leisure travel.`,
    amenities: hotelAmenities,
    nearbyPlaces: [
      { name: `${city} central market`, distance: `${1 + index % 4} km` },
      { name: `${city} railway station`, distance: `${2 + index % 5} km` },
      { name: `${city} airport`, distance: `${8 + index % 12} km` },
    ],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    rooms,
    userReviews: [
      { id: `${slug}-review-1`, userName: "Aarav Mehta", rating: 5, date: "2026-10-12", comment: "Comfortable room, helpful staff, and a convenient location.", helpful: 4 },
      { id: `${slug}-review-2`, userName: "Ananya Shah", rating: 4, date: "2026-09-28", comment: "Clean stay with good amenities and a smooth check-in.", helpful: 3 },
      { id: `${slug}-review-3`, userName: "Kabir Rao", rating: 4, date: "2026-08-16", comment: "Good value for a short city stay.", helpful: 2 },
    ],
    policies: {
      cancellation: "Free cancellation up to 24 hours before check-in",
      checkIn: "Check-in from 2:00 PM",
      checkOut: "Check-out by 11:00 AM",
      pets: "Pets are not allowed",
    },
    hostName: `${city} Hospitality Group`,
    hostEmail: `stay@${slug}.example.com`,
    hostPhone: "+91 90000 00000",
    latitude: 8 + (index % 30) * 1.8,
    longitude: 68 + (index % 28) * 2.4,
    popular: index < 10,
    active: true,
    isLuxury: index % 7 === 0,
    isTeVerified: true,
    isDeal: index % 5 === 0,
    isHandpicked: index % 3 === 0,
    dealDescription: index % 5 === 0 ? "Seasonal stay offer" : "",
    starCategory: index % 5 === 0 ? 5 : index % 2 === 0 ? 4 : 3,
    taxRate: 10,
    commissionRate: 10,
    customFields: {
      checkInInstructions: "Government-issued photo ID is required at check-in.",
      accessibility: "Accessible public areas and lift access available.",
      paymentNotes: "Cashfree and major cards accepted.",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seedIndiaHotels() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const collection = client.db(MONGODB_DB).collection("hotels");
    const hotels = destinations.map(createHotel);
    const operations = hotels.map((hotel) => ({
      updateOne: {
        filter: { seedKey: hotel.seedKey },
        update: { $set: hotel },
        upsert: true,
      },
    }));
    const result = await collection.bulkWrite(operations, { ordered: false });
    const seededCount = await collection.countDocuments({ seedKey: { $regex: "^india-hotel-" } });
    const incomplete = hotels.filter((hotel) =>
      !hotel.name || !hotel.state || !hotel.city || !hotel.address || !hotel.description ||
      !hotel.hostName || !hotel.rooms.length || hotel.rooms.some((room) =>
        !room.type || !room.price || !room.bedType || !room.size || !room.roomView || !room.amenities.length || !room.cancellationPolicy,
      ),
    );
    if (incomplete.length) throw new Error(`Generated ${incomplete.length} incomplete hotel records`);
    console.log(`Seeded ${hotels.length} complete Indian hotels into ${MONGODB_DB}.`);
    console.log(`Matched: ${result.matchedCount}; inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`);
    console.log(`Verified seeded hotel count: ${seededCount}.`);
  } finally {
    await client.close();
  }
}

seedIndiaHotels().catch((error) => {
  console.error("Failed to seed Indian hotels:", error);
  process.exitCode = 1;
});
