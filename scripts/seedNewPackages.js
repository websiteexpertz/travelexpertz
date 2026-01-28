import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

const newPackages = [
  {
    title: "Arunachal and Meghalaya – 11 Days / 10 Nights",
    description: "Discover the untouched beauty of Northeast India with a journey through Arunachal Pradesh and Meghalaya—where misty mountains, living root bridges, roaring waterfalls, serene monasteries, and vibrant tribal cultures come together.",
    fullDescription: "From Tawang's spiritual calm and high-altitude passes to Shillong's charm, Cherrapunji's rains, and Dawki's crystal-clear river, this package promises breathtaking landscapes, rich traditions, and unforgettable offbeat experiences.",
    duration: "11 Days / 10 Nights",
    startingPoint: "Guwahati",
    category: "Adventure Tours",
    badge: "Offbeat",
    image: "/packages/northeast-india.jpg",
    gallery: ["/packages/tawang.jpg", "/packages/dawki.jpg", "/packages/cherrapunji.jpg"],
    price: 45000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Guwahati to Bomdila",
        description: "Your journey begins with a warm pickup from Guwahati Airport/Railway Station. Drive towards the pristine landscapes of Arunachal Pradesh, enjoying lush valleys, winding mountain roads, and scenic river views along the way.",
        activities: ["Pickup from Guwahati", "Scenic drive through valleys", "Check-in at Bomdila hotel"],
        accommodation: "Hotel in Bomdila",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Bomdila to Tawang",
        description: "After breakfast, proceed towards Tawang. En route, visit the serene Bomdila Monastery, pay homage at Jaswantgarh War Memorial, and witness the beauty of Nuranang (Jang) Waterfall.",
        activities: ["Bomdila Monastery", "Jaswantgarh War Memorial", "Nuranang Waterfall", "Drive through mountain passes"],
        accommodation: "Hotel in Tawang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Tawang – Bumla Pass – Madhuri Lake – Tawang",
        description: "Post breakfast, embark on an unforgettable excursion to Bumla Pass, located near the Indo-China border. Visit the stunning Madhuri Lake (PT Tso Lake), surrounded by snow-capped peaks.",
        activities: ["Bumla Pass excursion", "Madhuri Lake visit", "Indo-China border area"],
        accommodation: "Hotel in Tawang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Tawang to Dirang",
        description: "Visit the iconic Tawang Monastery, the largest Buddhist monastery in India. Continue your journey crossing the breathtaking Sela Pass and Sela Lake.",
        activities: ["Tawang Monastery", "Sela Pass", "Sela Lake", "Jaswantgarh area"],
        accommodation: "Hotel in Dirang",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Dirang to Tezpur",
        description: "Explore the colorful Tipi Orchid Centre, Dirang Monastery, the picturesque Sangti Valley, and the offbeat Mandala Top, offering panoramic Himalayan views.",
        activities: ["Tipi Orchid Centre", "Dirang Monastery", "Sangti Valley", "Mandala Top"],
        accommodation: "Hotel in Tezpur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Tezpur to Shillong",
        description: "Drive to the capital city of Meghalaya—Shillong. Enjoy boating at the scenic Umiam Lake, followed by visits to the Don Bosco Museum and the lively Police Bazaar.",
        activities: ["Umiam Lake boating", "Don Bosco Museum", "Police Bazaar shopping"],
        accommodation: "Hotel in Shillong",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Shillong to Dawki",
        description: "Head towards Dawki. En route, stop at the dramatic Laitlum Canyons and refreshing Phe Phe Waterfall. Visit the famous Krangsuri Waterfall.",
        activities: ["Laitlum Canyons", "Phe Phe Waterfall", "Krangsuri Waterfall"],
        accommodation: "Hotel in Dawki",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Dawki to Cherrapunji",
        description: "Enjoy a boat ride on the crystal-clear Umngot River at Dawki. Continue to Mawlynnong, Asia's cleanest village, and explore the Single Living Root Bridge and Balancing Rock.",
        activities: ["Umngot River boat ride", "Indo-Bangladesh border", "Mawlynnong village", "Living Root Bridge", "Garden of Caves"],
        accommodation: "Hotel in Cherrapunji",
        meals: "Breakfast, Dinner"
      },
      {
        day: 9,
        title: "Trek to Double Decker Living Root Bridge",
        description: "Begin your trek from Tyrna Village to the iconic Double Decker Living Root Bridge. Continue further to the mesmerizing Rainbow Waterfall and Blue Lagoon Falls.",
        activities: ["Double Decker Living Root Bridge trek", "Rainbow Waterfall", "Blue Lagoon Falls"],
        accommodation: "Hotel in Cherrapunji",
        meals: "Breakfast, Dinner"
      },
      {
        day: 10,
        title: "Cherrapunji Local Sightseeing",
        description: "Explore Cherrapunji's natural wonders including caves, waterfalls, and viewpoints.",
        activities: ["Arwah Cave", "Mawsmai Cave", "Seven Sisters Waterfall", "Nohkalikai Falls", "Thangkharang Park", "Kynrem Falls"],
        accommodation: "Hotel in Cherrapunji",
        meals: "Breakfast, Dinner"
      },
      {
        day: 11,
        title: "Cherrapunji to Guwahati (Departure)",
        description: "Drive back to Guwahati. En route, visit Elephant Falls, Shillong Peak, and the scenic Mawkdok Dympep Valley Viewpoint. Drop at Guwahati Airport / Railway Station.",
        activities: ["Elephant Falls", "Shillong Peak", "Mawkdok Valley Viewpoint", "Optional: Maa Kamakhya Temple"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on double/triple sharing basis",
      "Daily breakfast and dinner",
      "All transfers and sightseeing by private vehicle",
      "Experienced driver with fuel and parking charges",
      "Bumla Pass permit and local vehicle charges",
      "All applicable taxes"
    ],
    exclusions: [
      "Airfare/train tickets",
      "Lunch and beverages",
      "Entry fees to monuments and parks",
      "Personal expenses and tips",
      "Travel insurance",
      "Anything not mentioned in inclusions"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges apply as per company policy. No refund for partial cancellation or unused services.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ek Dham Yatra – Badrinath (3N/4D)",
    description: "The Ek Dham Yatra to Badrinath offers a short yet spiritually fulfilling journey through the serene Garhwal Himalayas. Perfect for those seeking a quick pilgrimage with devotion and scenic mountain drives.",
    fullDescription: "Visit one of the most sacred shrines dedicated to Lord Vishnu, offering a divine aura and breathtaking Himalayan views.",
    duration: "3 Nights / 4 Days",
    startingPoint: "Haridwar / Dehradun",
    category: "Pilgrimage Tours",
    badge: "Spiritual",
    image: "/packages/badrinath-temple.jpg",
    gallery: ["/packages/badrinath-view.jpg", "/packages/mana-village.jpg"],
    price: 18000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar/Dehradun – Joshimath/Pipalkoti",
        description: "Drive through picturesque Himalayan roads, passing holy confluences like Devprayag, Rudraprayag, and Karnaprayag.",
        activities: ["Scenic mountain drive", "River valley views", "Check-in at hotel"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Joshimath/Pipalkoti – Badrinath",
        description: "Head toward the holy Badrinath Dham. Visit Badrinath Temple, Tapt Kund, Brahma Kapal, and Mana Village. Attend evening aarti.",
        activities: ["Badrinath Temple darshan", "Tapt Kund", "Brahma Kapal", "Mana Village", "Evening aarti"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Badrinath – Rudraprayag/Srinagar",
        description: "After morning darshan, begin return journey through scenic Himalayan routes with tranquil river views.",
        activities: ["Morning darshan", "Scenic return drive", "River views"],
        accommodation: "Hotel in Rudraprayag/Srinagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Rudraprayag/Srinagar – Haridwar/Dehradun (Departure)",
        description: "Drive back to Haridwar or Dehradun, marking the completion of your divine Ek Dham Yatra.",
        activities: ["Return journey", "Drop at Haridwar/Dehradun"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on double/triple sharing",
      "Daily breakfast and dinner",
      "All transfers by private vehicle",
      "Driver allowance and fuel",
      "All applicable taxes"
    ],
    exclusions: [
      "Train/flight tickets",
      "Lunch and beverages",
      "Entry fees and pony/doli charges",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per policy. Weather-related disruptions are subject to company decision.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Ek Dham Yatra – Badrinath from Delhi (5N/6D)",
    description: "A spiritually uplifting experience amid the serene Garhwal Himalayas. This journey blends devotion, scenic drives, and the divine energy of Badrinath Temple.",
    fullDescription: "Ideal for families, elders, and pilgrims seeking a peaceful spiritual retreat to one of the holiest shrines dedicated to Lord Vishnu.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Delhi",
    category: "Pilgrimage Tours",
    badge: "Popular",
    image: "/packages/badrinath-dham.jpg",
    gallery: ["/packages/badrinath-mountain.jpg", "/packages/haridwar-ganga.jpg"],
    price: 24000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Delhi – Haridwar",
        description: "Drive from Delhi to Haridwar. After check-in, explore the ghats and witness the mesmerizing Ganga Aarti in the evening.",
        activities: ["Drive to Haridwar", "Ghat exploration", "Evening Ganga Aarti"],
        accommodation: "Hotel in Haridwar",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Haridwar – Joshimath/Pipalkoti",
        description: "Scenic drive through mountains, passing Devprayag, Rudraprayag, and Karnaprayag—three sacred confluences.",
        activities: ["Mountain drive", "River confluences", "Himalayan views"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Joshimath/Pipalkoti – Badrinath",
        description: "Visit Badrinath Temple and offer prayers to Lord Vishnu. Explore Tapt Kund, Brahma Kapal, and attend evening aarti.",
        activities: ["Badrinath Temple darshan", "Tapt Kund", "Brahma Kapal", "Evening aarti"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Badrinath – Rudraprayag/Srinagar",
        description: "After morning darshan, return journey with serene riverside views and mountain landscapes.",
        activities: ["Morning darshan", "Return drive", "Mountain scenery"],
        accommodation: "Hotel in Rudraprayag/Srinagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Rudraprayag/Srinagar – Haridwar",
        description: "Drive back to Haridwar. Relax or take an evening stroll along the sacred ghats.",
        activities: ["Drive to Haridwar", "Evening at ghats"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Haridwar – Delhi (Departure)",
        description: "Proceed back to Delhi with divine blessings from Badrinath Dham and cherished Himalayan memories.",
        activities: ["Return to Delhi", "Drop at airport/railway station"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "All transfers by private vehicle",
      "Driver charges and fuel",
      "Toll and parking charges",
      "All applicable taxes"
    ],
    exclusions: [
      "Flight/train fare",
      "Lunch and drinks",
      "Monument entry fees",
      "Pony/doli/helicopter charges",
      "Personal expenses and tips",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies. No refund for unused services.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Do Dham Yatra – Kedarnath & Badrinath (5N/6D)",
    description: "A sacred spiritual journey covering two of Uttarakhand's holiest shrines—Kedarnath and Badrinath. Nestled in the majestic Garhwal Himalayas, this pilgrimage offers devotion, natural beauty, and adventure.",
    fullDescription: "Experience the divine aura of Lord Shiva at Kedarnath and Lord Vishnu at Badrinath with serene mountain landscapes.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Haridwar / Dehradun",
    category: "Pilgrimage Tours",
    badge: "Bestseller",
    image: "/packages/do-dham.jpg",
    gallery: ["/packages/kedarnath.jpg", "/packages/badrinath-view.jpg"],
    price: 32000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar/Dehradun – Guptkashi",
        description: "Drive through picturesque mountain roads toward Guptkashi, passing lush forests, rivers, and quaint hill towns.",
        activities: ["Mountain drive", "Scenic stops", "Check-in at Guptkashi"],
        accommodation: "Hotel in Guptkashi",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Guptkashi – Kedarnath",
        description: "Proceed to Sonprayag, then Gaurikund. Trek to Kedarnath Temple set amidst snow-capped Himalayan peaks. Helicopter option available.",
        activities: ["Drive to Gaurikund", "Trek to Kedarnath (16-18 km)", "Kedarnath darshan"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Kedarnath – Guptkashi",
        description: "After early morning darshan, trek down to Gaurikund and drive back to Guptkashi.",
        activities: ["Morning darshan", "Trek down", "Return to Guptkashi"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Guptkashi – Badrinath",
        description: "Drive through scenic mountain terrain toward Badrinath. Visit the temple and attend evening aarti if time permits.",
        activities: ["Drive to Badrinath", "Temple darshan", "Evening aarti"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Badrinath – Rudraprayag/Srinagar",
        description: "After morning darshan, explore Mana Village—India's last village near Tibet border. Proceed toward Rudraprayag or Srinagar.",
        activities: ["Morning darshan", "Mana Village", "Return journey"],
        accommodation: "Hotel in Rudraprayag/Srinagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Rudraprayag/Srinagar – Haridwar/Dehradun (Departure)",
        description: "Drive back to Haridwar or Dehradun, completing your divine Do Dham Yatra with blessings from both shrines.",
        activities: ["Return drive", "Drop at Haridwar/Dehradun"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "All transfers by private vehicle",
      "Driver and fuel charges",
      "Toll and parking",
      "All taxes"
    ],
    exclusions: [
      "Train/flight tickets",
      "Lunch and beverages",
      "Kedarnath trek charges (pony/doli/helicopter)",
      "Entry fees and personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation policy as per company terms. Trek/helicopter subject to weather conditions.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Do Dham Yatra – Kedarnath & Badrinath from Delhi (7N/8D)",
    description: "The revered Do Dham Yatra brings pilgrims closer to divine blessings, spiritual cleansing, and the breathtaking beauty of the Garhwal Himalayas.",
    fullDescription: "Experience the sacred journey to both Kedarnath (Lord Shiva) and Badrinath (Lord Vishnu) with complete peace and devotion.",
    duration: "7 Nights / 8 Days",
    startingPoint: "Delhi",
    category: "Pilgrimage Tours",
    badge: "Premium",
    image: "/packages/char-dham.jpg",
    gallery: ["/packages/kedarnath-temple.jpg", "/packages/badrinath-shrine.jpg"],
    price: 38000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Delhi – Haridwar",
        description: "Drive from Delhi to Haridwar. After check-in, witness the soul-stirring Ganga Aarti at Har Ki Pauri.",
        activities: ["Drive to Haridwar", "Check-in", "Evening Ganga Aarti"],
        accommodation: "Hotel in Haridwar",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Haridwar – Guptkashi",
        description: "Drive through winding mountain roads and scenic river valleys en route to Guptkashi with views of Chaukhamba peaks.",
        activities: ["Mountain drive", "Scenic valleys", "Check-in at Guptkashi"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Guptkashi – Kedarnath",
        description: "Proceed to Gaurikund and trek to Kedarnath Temple, one of the 12 Jyotirlingas. Helicopter option available from nearby helipads.",
        activities: ["Drive to Gaurikund", "Trek to Kedarnath", "Temple darshan"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Kedarnath – Guptkashi",
        description: "After morning darshan, trek down to Gaurikund and return to Guptkashi. Evening for rest and recovery.",
        activities: ["Morning darshan", "Trek down", "Drive to Guptkashi"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Guptkashi – Badrinath",
        description: "Drive to Badrinath Dham, surrounded by Nar–Narayan mountain ranges. Attend evening aarti or visit Tapt Kund and Brahma Kapal.",
        activities: ["Drive to Badrinath", "Temple darshan", "Evening aarti", "Tapt Kund"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Badrinath – Rudraprayag/Pipalkoti",
        description: "After morning darshan, visit Mana Village and proceed toward Rudraprayag or Pipalkoti with serene riverside views.",
        activities: ["Morning darshan", "Mana Village visit", "Return drive"],
        accommodation: "Hotel in Rudraprayag/Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Rudraprayag/Pipalkoti – Haridwar",
        description: "Drive back to Haridwar. Relax or explore the holy ghats in the evening.",
        activities: ["Return to Haridwar", "Evening leisure"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Haridwar – Delhi (Departure)",
        description: "After breakfast, proceed back to Delhi with divine blessings from Kedarnath and Badrinath.",
        activities: ["Return to Delhi", "Drop at airport/railway station"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "All transfers by private vehicle",
      "Driver allowance and fuel",
      "Parking and toll charges",
      "All applicable taxes"
    ],
    exclusions: [
      "Flight/train tickets",
      "Lunch and beverages",
      "Kedarnath trek/helicopter charges",
      "Entry fees and personal expenses",
      "Tips and gratuities",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation charges apply. Trek dependent on weather and health conditions.",
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
