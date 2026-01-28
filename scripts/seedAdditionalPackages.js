import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

const newPackages = [
  {
    title: "Shimla & Surroundings Himalayan Retreat",
    description: "Experience the colonial charm and natural beauty of Himachal Pradesh with this relaxing Shimla tour. From heritage streets and scenic viewpoints to adventure spots and peaceful hill escapes.",
    fullDescription: "Perfect blend of leisure, sightseeing, and mountain serenity covering Shimla, Kufri, Naldehra, and Chail.",
    duration: "5 Days / 4 Nights",
    startingPoint: "Chandigarh / Delhi",
    category: "Hill Station Tours",
    badge: "Colonial Charm",
    image: "/packages/shimla-heritage.jpg",
    gallery: ["/packages/shimla-mall-road.jpg", "/packages/kufri.jpg", "/packages/chail-palace.jpg"],
    price: 18000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival – Transfer to Shimla",
        description: "Welcome at Chandigarh/Delhi and drive to Shimla, former summer capital of British India. Evening at Mall Road and The Ridge.",
        activities: ["Drive to Shimla", "Check-in", "Mall Road", "The Ridge", "Local cafés"],
        accommodation: "Hotel in Shimla",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Shimla Local Sightseeing",
        description: "Explore Shimla's colonial heritage and panoramic viewpoints.",
        activities: ["Jakhoo Temple", "Christ Church", "Scandal Point", "Viceregal Lodge", "Lakkar Bazaar", "Shopping"],
        accommodation: "Hotel in Shimla",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Kufri Excursion",
        description: "Visit popular hill station Kufri known for snow activities and scenic beauty. Optional adventure activities.",
        activities: ["Kufri Fun World", "Mahasu Peak", "Himalayan Nature Park", "Skiing", "Horse riding"],
        accommodation: "Hotel in Shimla",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Naldehra & Chail Excursion",
        description: "Explore Naldehra Golf Course and Chail Palace with world's highest cricket ground.",
        activities: ["Naldehra Golf Course", "Chail Palace", "Chail Cricket Ground", "Mountain views"],
        accommodation: "Hotel in Shimla",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Shimla – Departure",
        description: "Transfer to Chandigarh/Delhi after breakfast with refreshing memories of Shimla's hills.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "4 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Local sightseeing & excursions",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Adventure activities (skiing, horse riding)",
      "Entry fees",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Arunachal Pradesh & Kaziranga Adventure",
    description: "Explore the pristine beauty of Northeast India from Bhalukpong through Dirang and Tawang to Bomdila. Experience ancient monasteries, sacred lakes, high-altitude passes, war memorials, and stunning Himalayan landscapes.",
    fullDescription: "Journey through Arunachal's gateway, visit Tawang Monastery, Sela Pass, Madhuri Lake, Bumla Pass, and experience the untouched beauty of Eastern Himalayas.",
    duration: "6 Days / 5 Nights",
    startingPoint: "Guwahati",
    category: "Adventure Tours",
    badge: "Northeast Explorer",
    image: "/packages/arunachal-tawang.jpg",
    gallery: ["/packages/tawang-monastery.jpg", "/packages/sela-pass.jpg", "/packages/madhuri-lake.jpg"],
    price: 35000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Guwahati to Bhalukpong",
        description: "Travel from Guwahati to Bhalukpong, gateway to Arunachal Pradesh. Check in and relax.",
        activities: ["Drive to Bhalukpong", "Check-in", "Leisure time"],
        accommodation: "Hotel in Bhalukpong",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Bhalukpong Sightseeing – Dirang",
        description: "Visit Pakhui Wildlife Sanctuary, Sessa Orchid Sanctuary, Bhalukpong Fort, and Kameng River. Drive to Dirang.",
        activities: ["Wildlife sanctuary", "Orchid sanctuary", "Bhalukpong Fort", "Kameng River", "Drive to Dirang"],
        accommodation: "Hotel in Dirang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Dirang Sightseeing",
        description: "Explore Dirang Dzong, Thupsung Dhargyeling Monastery, National Research Centre on Yak, Sangti Valley, Mandala Top, and Hot Water Springs.",
        activities: ["Dirang Dzong", "Monastery", "Yak Research Centre", "Sangti Valley", "Mandala Top", "Hot Springs"],
        accommodation: "Hotel in Dirang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Dirang to Tawang & Sightseeing",
        description: "Drive to Tawang through scenic Himalayan landscape. Visit Tawang Monastery and Urgelling Monastery. Explore local markets.",
        activities: ["Drive to Tawang", "Tawang Monastery", "Urgelling Monastery", "Local markets", "Regional cuisine"],
        accommodation: "Hotel in Tawang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Tawang – Sela Pass – Madhuri Lake – Bumla Pass",
        description: "Visit Sela Pass, Madhuri Lake (Sangetsar Lake), Nuranang Falls, Bumla Pass near Indo-China border, and Tawang War Memorial.",
        activities: ["Sela Pass", "Madhuri Lake", "Nuranang Falls", "Bumla Pass", "War Memorial"],
        accommodation: "Hotel in Tawang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Tawang to Bomdila – Guwahati",
        description: "Drive from Tawang to Bomdila. Visit Bomdila Monastery, viewpoint, R.R. Hill, and Gompas. Continue to Guwahati for drop at airport/railway station.",
        activities: ["Drive to Bomdila", "Monastery visit", "Viewpoints", "Return to Guwahati", "Drop at station/airport"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "5 Nights accommodation",
      "Daily breakfast and dinner",
      "Private vehicle transfers",
      "All sightseeing as per itinerary",
      "Inner line permits",
      "Driver charges",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train tickets",
      "Lunch",
      "Entry fees at monuments",
      "Personal expenses",
      "Travel insurance",
      "Anything not mentioned"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges apply. Permits subject to government approval. Weather-dependent itinerary changes possible.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Valley of Flowers & Hemkund Sahib Yatra",
    description: "Journey blending nature, devotion, and adventure to Valley of Flowers (UNESCO World Heritage Site) and sacred Hemkund Sahib, one of Sikhism's highest shrines at 4,633 meters.",
    fullDescription: "Experience vibrant alpine meadows, snow-capped peaks, spiritual serenity, and Himalayan beauty over 8 unforgettable days.",
    duration: "7 Nights / 8 Days",
    startingPoint: "Delhi",
    category: "Pilgrimage Tours",
    badge: "UNESCO Heritage",
    image: "/packages/valley-of-flowers.jpg",
    gallery: ["/packages/hemkund-sahib-lake.jpg", "/packages/alpine-meadows.jpg", "/packages/ghangaria.jpg"],
    price: 32000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Delhi – Haridwar",
        description: "Drive from Delhi to holy city of Haridwar. Attend enchanting Ganga Aarti at Har Ki Pauri.",
        activities: ["Drive to Haridwar", "Check-in", "Ganga Aarti"],
        accommodation: "Hotel in Haridwar",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Haridwar – Joshimath/Pipalkoti",
        description: "Drive through scenic Himalayan routes passing sacred confluences of Devprayag, Rudraprayag, and Karnaprayag.",
        activities: ["Mountain drive", "River confluences", "Himalayan views"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Joshimath – Govindghat – Ghangaria",
        description: "Drive to Govindghat and trek to Ghangaria through picturesque trails with waterfalls, streams, and coniferous forests.",
        activities: ["Drive to Govindghat", "Trek to Ghangaria (10-12 km)", "Forest trails", "Waterfalls"],
        accommodation: "Hotel in Ghangaria",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Ghangaria – Valley of Flowers – Ghangaria",
        description: "Trek to enchanting Valley of Flowers with vibrant carpet of Himalayan flowers, lush meadows, and stunning vistas.",
        activities: ["Valley of Flowers trek (6-7 km)", "Alpine meadows", "Flower viewing", "Photography"],
        accommodation: "Hotel in Ghangaria",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Ghangaria – Hemkund Sahib – Ghangaria",
        description: "Spiritual trek to Hemkund Sahib at 4,633m altitude. Visit sacred Gurudwara beside serene Hemkund Lake surrounded by snow-clad peaks.",
        activities: ["Hemkund Sahib trek (6 km steep)", "Gurudwara darshan", "Holy dip", "Lake views"],
        accommodation: "Hotel in Ghangaria",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Ghangaria – Govindghat – Joshimath/Pipalkoti",
        description: "Descend from Ghangaria to Govindghat and drive back to Joshimath. Rest in calm Himalayan ambience.",
        activities: ["Trek down", "Drive to Joshimath", "Relaxation"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Joshimath/Pipalkoti – Haridwar",
        description: "Drive back to Haridwar through beautiful mountain routes and river valleys.",
        activities: ["Return drive", "Mountain views", "River valleys"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Haridwar – Delhi (Departure)",
        description: "Depart for Delhi with blessings from Hemkund Sahib and natural splendour of Valley of Flowers.",
        activities: ["Return to Delhi", "Drop at airport/station"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "7 Nights accommodation",
      "Daily breakfast and dinner",
      "Private vehicle transfers",
      "All trekking arrangements",
      "Permits and entry fees",
      "Driver charges",
      "All taxes"
    ],
    exclusions: [
      "Train/flight tickets",
      "Lunch",
      "Porter/pony charges",
      "Personal trekking equipment",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Trek subject to weather conditions and fitness. Valley of Flowers open June-October only. No refund for weather cancellations.",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedPackages() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const pkg of newPackages) {
      // Check if package already exists
      const existing = await packagesCollection.findOne({
        title: pkg.title,
      });

      if (existing) {
        console.log(`⚠️  Package already exists: ${pkg.title}`);
        skippedCount++;
        continue;
      }

      await packagesCollection.insertOne(pkg);
      console.log(`✅ Inserted: ${pkg.title}`);
      insertedCount++;
    }

    console.log("\n📦 Seeding Complete!");
    console.log(`   ✅ Inserted: ${insertedCount} packages`);
    console.log(`   ⚠️  Skipped: ${skippedCount} packages (already exist)`);
  } catch (error) {
    console.error("❌ Error seeding packages:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedPackages();
