import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

const newPackages = [
  {
    title: "Ek Dham Yatra – Kedarnath from Delhi (5N/6D)",
    description: "Begin your spiritual journey to Kedarnath, one of the 12 Jyotirlingas and a powerful seat of Lord Shiva. This pilgrimage through the Garhwal Himalayas offers divine blessings and breathtaking mountain beauty.",
    fullDescription: "Experience the sacred Kedarnath valley with comfortable stays, scenic drives, and a spiritually uplifting trek to one of India's holiest temples.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Delhi",
    category: "Pilgrimage Tours",
    badge: "Divine Journey",
    image: "/packages/kedarnath-from-delhi.jpg",
    gallery: ["/packages/kedarnath-temple-view.jpg", "/packages/guptkashi.jpg"],
    price: 26000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Delhi – Haridwar",
        description: "Drive to holy city of Haridwar. Witness divine Ganga Aarti at Har Ki Pauri.",
        activities: ["Drive to Haridwar", "Ganga Aarti", "Ghat visit"],
        accommodation: "Hotel in Haridwar",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Haridwar – Guptkashi",
        description: "Travel through mountains and valleys to Guptkashi with stunning views of Chaukhamba peaks.",
        activities: ["Mountain drive", "Vishwanath Temple", "Himalayan views"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Guptkashi – Kedarnath",
        description: "Trek to Kedarnath Temple, one of India's most revered Shiva shrines. Helicopter option available.",
        activities: ["Trek to Kedarnath (16-18 km)", "Temple darshan", "Evening prayers"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Kedarnath – Guptkashi",
        description: "Morning temple visit followed by trek down to Gaurikund and drive to Guptkashi.",
        activities: ["Morning darshan", "Trek down", "Return drive"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Guptkashi – Haridwar",
        description: "Return journey to Haridwar with scenic mountain landscapes and river confluences.",
        activities: ["Return drive", "Mountain views", "Haridwar arrival"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Haridwar – Delhi (Departure)",
        description: "Return to Delhi with divine blessings from Kedarnath Temple.",
        activities: ["Return to Delhi", "Drop at airport/station"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "Private vehicle transfers",
      "Driver charges and fuel",
      "All taxes"
    ],
    exclusions: [
      "Train/flight tickets",
      "Lunch",
      "Trek charges (pony/doli/helicopter)",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per policy. Trek subject to weather conditions.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Kullu–Manali Himalayan Adventure & Leisure Tour",
    description: "Discover the magic of Himachal Pradesh with this extended Kullu–Manali getaway. Snow-clad peaks, lush valleys, sacred temples, adventure activities, and relaxed mountain vibes.",
    fullDescription: "Perfect for families, couples, and nature lovers seeking both adventure and relaxation in the Himalayas.",
    duration: "5 Days / 4 Nights",
    startingPoint: "Chandigarh / Delhi",
    category: "Adventure Tours",
    badge: "Mountain Escape",
    image: "/packages/kullu-manali.jpg",
    gallery: ["/packages/manali-valley.jpg", "/packages/solang.jpg"],
    price: 20000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival – Transfer to Manali",
        description: "Scenic drive to Manali along rivers and valleys. Evening at Mall Road.",
        activities: ["Drive to Manali", "Check-in", "Mall Road exploration"],
        accommodation: "Hotel in Manali",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Manali Local Sightseeing",
        description: "Visit Hadimba Temple, Vashisht Hot Springs, Manu Temple, Van Vihar, and Tibetan Monastery.",
        activities: ["Hadimba Temple", "Hot springs", "Manu Temple", "Van Vihar", "Monastery"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Solang Valley / Atal Tunnel Excursion",
        description: "Adventure sports at Solang Valley. Optional Atal Tunnel visit.",
        activities: ["Solang Valley", "Paragliding", "Skiing", "Zorbing", "Atal Tunnel"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Kullu Sightseeing",
        description: "Visit Kullu Shawl Factory, Vaishno Devi Temple, and Beas River viewpoint.",
        activities: ["Shawl factory", "Vaishno Devi Temple", "River views", "Shopping"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Manali – Departure",
        description: "Transfer to Chandigarh/Delhi airport or railway station.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "4 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Local sightseeing",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Adventure activities",
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
    title: "Kumaon Lakes, Hills & Wildlife Tour",
    description: "Perfect blend of serene hill stations, pristine lakes, spiritual sites, panoramic Himalayan views, and thrilling wildlife experiences in Jim Corbett National Park.",
    fullDescription: "From Nainital's charm to Kausani's vistas and Corbett's wild beauty, this journey offers a complete Himalayan escape.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Kathgodam",
    category: "Nature Tours",
    badge: "Complete Kumaon",
    image: "/packages/kumaon-lakes.jpg",
    gallery: ["/packages/bhimtal.jpg", "/packages/kausani.jpg", "/packages/corbett.jpg"],
    price: 24000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Kathgodam – Nainital",
        description: "Arrive at Kathgodam and drive to Nainital. Explore Naini Lake, Naina Devi Temple, and Mall Road.",
        activities: ["Drive to Nainital", "Naini Lake", "Temple visit", "Mall Road"],
        accommodation: "Hotel in Nainital",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Nainital – Bhimtal",
        description: "Visit Bhimtal Lake, Sattal (Seven Lakes), and Naukuchiatal. Enjoy peaceful nature walks.",
        activities: ["Bhimtal Lake", "Sattal", "Naukuchiatal", "Nature walks"],
        accommodation: "Hotel in Bhimtal",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Bhimtal – Mukteshwar",
        description: "Visit Mukteshwar Dham Temple with panoramic Himalayan views and serene atmosphere.",
        activities: ["Mukteshwar Temple", "Himalayan views", "Nature walks"],
        accommodation: "Hotel in Mukteshwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Mukteshwar – Kausani",
        description: "Drive to Kausani, the 'Switzerland of India'. Visit Anasakti Ashram and enjoy sunset over mountains.",
        activities: ["Anasakti Ashram", "Himalayan views", "Sunset"],
        accommodation: "Hotel in Kausani",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Kausani – Ramnagar",
        description: "Drive to Ramnagar, gateway to Jim Corbett National Park. Relax in natural surroundings.",
        activities: ["Drive to Ramnagar", "Check-in", "Leisure time"],
        accommodation: "Hotel in Ramnagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Ramnagar – Kathgodam (Departure)",
        description: "Optional jungle safari in Jim Corbett. Return to Kathgodam.",
        activities: ["Optional jungle safari", "Return to Kathgodam"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "5 Nights accommodation",
      "Daily breakfast",
      "Private vehicle",
      "All transfers",
      "All taxes"
    ],
    exclusions: [
      "Train fare",
      "Lunches and dinners",
      "Jungle safari charges",
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
    title: "Kumaon Spiritual & Nature Tour",
    description: "Thoughtfully curated Kumaon tour blending serene hill stations, ancient temples, sacred sites, and wildlife experiences from Nainital to Jageshwar, Gangolihat, and Corbett.",
    fullDescription: "Ideal for travelers seeking spirituality, nature, and calm Himalayan escapes.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Kathgodam",
    category: "Pilgrimage Tours",
    badge: "Spiritual Journey",
    image: "/packages/kumaon-spiritual.jpg",
    gallery: ["/packages/jageshwar.jpg", "/packages/gangolihat.jpg"],
    price: 22000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Kathgodam – Nainital",
        description: "Transfer to Nainital. Visit Naini Lake, Naina Devi Temple, and Mall Road.",
        activities: ["Drive to Nainital", "Boat ride", "Temple visit", "Shopping"],
        accommodation: "Hotel in Nainital",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Nainital Sightseeing",
        description: "Visit Snow View Point, Tiffin Top, Naina Peak, Bhimtal, Sattal, and Naukuchiatal.",
        activities: ["Snow View Point", "Tiffin Top", "Lake visits"],
        accommodation: "Hotel in Nainital",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Nainital – Jageshwar",
        description: "Drive through pine forests to Jageshwar Dham, cluster of 100+ ancient Shiva temples.",
        activities: ["Jageshwar temples", "Forest walk", "Meditation"],
        accommodation: "Hotel in Jageshwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Jageshwar – Gangolihat",
        description: "Visit Haat Kalika Temple with stunning Himalayan views and spiritual atmosphere.",
        activities: ["Haat Kalika Temple", "Mountain views", "Prayer time"],
        accommodation: "Hotel in Gangolihat",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Gangolihat – Ramnagar",
        description: "Drive to Ramnagar through changing landscapes. Relax by riverside.",
        activities: ["Drive to Ramnagar", "Nature walks", "Riverside relaxation"],
        accommodation: "Hotel in Ramnagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Ramnagar – Kathgodam (Departure)",
        description: "Optional jeep safari in Jim Corbett. Return to Kathgodam.",
        activities: ["Optional safari", "Return journey"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "5 Nights accommodation",
      "Daily breakfast",
      "Private vehicle",
      "All transfers",
      "All taxes"
    ],
    exclusions: [
      "Train fare",
      "Lunches and dinners",
      "Safari charges",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Kumaon Heritage & Spiritual Tour – Champawat, Lohaghat, Pancheshwar",
    description: "Soulful journey through culturally rich and spiritually significant landscapes. From ancient temples of Champawat to serene Lohaghat and sacred Pancheshwar confluence.",
    fullDescription: "Perfect for travelers seeking peace, heritage, and Himalayan tranquility with colonial charm.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Tanakpur",
    category: "Cultural Tours",
    badge: "Heritage Trail",
    image: "/packages/champawat.jpg",
    gallery: ["/packages/abbott-mount.jpg", "/packages/pancheshwar.jpg"],
    price: 19000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Tanakpur – Champawat",
        description: "Drive to Champawat. Visit Baleshwar Temple with exquisite stone carvings.",
        activities: ["Drive to Champawat", "Baleshwar Temple", "Local markets"],
        accommodation: "Hotel in Champawat",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Champawat – Lohaghat / Abbott Mount",
        description: "Visit Lohaghat and Abbott Mount with colonial charm and panoramic Himalayan views.",
        activities: ["Abbott Mount", "Church visit", "Pine forests", "Mountain views"],
        accommodation: "Hotel in Lohaghat/Abbott Mount",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Lohaghat / Abbott Mount Sightseeing",
        description: "Leisure day for nature walks, viewpoints, and cultural village interactions.",
        activities: ["Nature walks", "Forest trails", "Village visits", "Relaxation"],
        accommodation: "Hotel in Lohaghat/Abbott Mount",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Lohaghat – Pancheshwar",
        description: "Visit sacred Pancheshwar Mahadev Temple at Kali-Saryu confluence, Indo-Nepal border.",
        activities: ["Pancheshwar Temple", "River confluence", "Border views"],
        accommodation: "Hotel in Pancheshwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Pancheshwar – Tanakpur",
        description: "Return to Tanakpur. Visit Sharda Ghat for riverside relaxation.",
        activities: ["Return drive", "Sharda Ghat", "Riverside walk"],
        accommodation: "Hotel in Tanakpur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Departure from Tanakpur",
        description: "Check out and depart with divine memories of Kumaon.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "5 Nights accommodation",
      "Daily breakfast",
      "All transfers",
      "Driver allowances",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train tickets",
      "Lunches and dinners",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Meghalaya Tour – Shillong, Cherrapunji, Dawki",
    description: "Unwind in nature's lap exploring emerald valleys, pristine waterfalls, scenic viewpoints, and Living Root Bridges. Luxury escape promising comfort, serenity, and unforgettable landscapes.",
    fullDescription: "Experience the wettest place on Earth, crystal-clear rivers, and unique natural wonders of Meghalaya.",
    duration: "4 Days / 3 Nights",
    startingPoint: "Guwahati",
    category: "Nature Tours",
    badge: "Nature's Paradise",
    image: "/packages/meghalaya.jpg",
    gallery: ["/packages/cherrapunji-falls.jpg", "/packages/dawki-river.jpg", "/packages/living-root-bridge.jpg"],
    price: 18000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Guwahati to Shillong",
        description: "Drive to Shillong. Visit Ward's Lake, Elephant Falls, Shillong Peak, Umiam Lake, and Police Bazaar.",
        activities: ["Ward's Lake", "Elephant Falls", "Shillong Peak", "Umiam Lake", "Shopping"],
        accommodation: "Hotel in Shillong",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Shillong to Cherrapunji",
        description: "Explore Mawsmai Cave, Arwah Cave, Seven Sisters Falls, Dainthlen Falls, Wei Sawdong Falls, and Rainbow Falls.",
        activities: ["Mawsmai Cave", "Seven Sisters Falls", "Eco Park", "Multiple waterfalls"],
        accommodation: "Hotel in Cherrapunji",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Cherrapunji to Dawki (Shnongpdeng)",
        description: "Visit Living Root Bridge, Sky Walk, Balancing Rocks, and India-Bangladesh border. Evening bonfire and stargazing.",
        activities: ["Living Root Bridge", "Sky Walk", "Border viewpoint", "Bonfire"],
        accommodation: "Riverside camp/hotel in Dawki",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Dawki to Guwahati (Departure)",
        description: "Boat ride on crystal-clear Umngot River. Optional cliff jumping or kayaking. Return to Guwahati.",
        activities: ["Umngot River boat ride", "Adventure activities", "Return journey"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "3 Nights accommodation",
      "Daily breakfast",
      "Private vehicle",
      "All transfers",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train tickets",
      "Lunches and dinners",
      "Entry fees",
      "Adventure activities",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per company policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Nainital Lake & Himalayan Escape",
    description: "Escape to serene hills of Uttarakhand with this refreshing Nainital tour. Surrounded by lush forests, tranquil lakes, and breathtaking mountain views.",
    fullDescription: "Perfect blend of relaxation, sightseeing, and nature's charm in the Lake District.",
    duration: "4 Days / 3 Nights",
    startingPoint: "Kathgodam",
    category: "Nature Tours",
    badge: "Lake Paradise",
    image: "/packages/nainital-lake.jpg",
    gallery: ["/packages/naini-lake.jpg", "/packages/snow-view.jpg"],
    price: 14000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Kathgodam – Transfer to Nainital",
        description: "Transfer to Nainital. Evening at Mall Road or Naini Lake.",
        activities: ["Drive to Nainital", "Check-in", "Mall Road", "Lake view"],
        accommodation: "Hotel in Nainital",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Nainital Local Sightseeing",
        description: "Visit Naini Lake, Naina Devi Temple, Snow View Point, Tiffin Top, and Eco Cave Garden.",
        activities: ["Boating", "Temple visit", "Snow View Point", "Tiffin Top", "Eco Caves"],
        accommodation: "Hotel in Nainital",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Nainital – Nearby Excursions",
        description: "Visit Bhimtal, Sattal (seven lakes), and Naukuchiatal (nine-cornered lake).",
        activities: ["Bhimtal visit", "Sattal exploration", "Naukuchiatal", "Nature walks"],
        accommodation: "Hotel in Nainital",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Nainital – Departure",
        description: "Transfer to Kathgodam Railway Station after breakfast.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "3 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Local sightseeing",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Boating charges",
      "Ropeway tickets",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Nainital, Kainchi Dham & Mukteshwar Hill Escape",
    description: "Experience serene beauty and spiritual calm of Kumaon. From lakeside charm of Nainital and divine Kainchi Dham to panoramic Himalayan views of Mukteshwar.",
    fullDescription: "Perfect blend of nature, peace, and devotion for a refreshing hill getaway.",
    duration: "4 Days / 3 Nights",
    startingPoint: "Kathgodam",
    category: "Pilgrimage Tours",
    badge: "Spiritual Hills",
    image: "/packages/kainchi-dham.jpg",
    gallery: ["/packages/mukteshwar-temple.jpg", "/packages/chauli-ki-jali.jpg"],
    price: 16000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Kathgodam – Transfer to Nainital",
        description: "Scenic drive to Nainital. Evening at Mall Road or Naini Lake.",
        activities: ["Drive to Nainital", "Check-in", "Mall Road", "Lake leisure"],
        accommodation: "Hotel in Nainital",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Nainital Local Sightseeing",
        description: "Visit Naini Lake, Naina Devi Temple, Snow View Point, Tiffin Top, and Eco Cave Garden.",
        activities: ["Boating", "Temple", "Viewpoints", "Eco Caves", "Shopping"],
        accommodation: "Hotel in Nainital",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Nainital – Kainchi Dham – Mukteshwar",
        description: "Visit Kainchi Dham ashram of Neem Karoli Baba. Continue to Mukteshwar for sunset views.",
        activities: ["Kainchi Dham", "Prayer & meditation", "Drive to Mukteshwar", "Sunset"],
        accommodation: "Hotel in Mukteshwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Mukteshwar Sightseeing – Departure",
        description: "Visit Mukteshwar Temple and Chauli Ki Jali viewpoint. Transfer to Kathgodam.",
        activities: ["Temple visit", "Chauli Ki Jali", "Orchards", "Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "3 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "All sightseeing",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Boating/ropeway charges",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Panch Kedar Yatra – 11 Nights / 12 Days",
    description: "One of the most revered pilgrimages in the Garhwal Himalayas dedicated to Lord Shiva. Covering five sacred temples—Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, and Kalpeshwar.",
    fullDescription: "Journey blends spirituality, trekking adventure, Himalayan beauty, and deep cultural experiences through dense forests, peaceful meadows, and ancient shrines.",
    duration: "11 Nights / 12 Days",
    startingPoint: "Haridwar / Dehradun",
    category: "Pilgrimage Tours",
    badge: "Ultimate Pilgrimage",
    image: "/packages/panch-kedar.jpg",
    gallery: ["/packages/tungnath.jpg", "/packages/rudranath.jpg", "/packages/madhyamaheshwar.jpg"],
    price: 55000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar/Dehradun – Guptkashi",
        description: "Drive through Himalayan roads to Guptkashi with panoramic Chaukhamba peaks views.",
        activities: ["Mountain drive", "Chaukhamba views", "Check-in"],
        accommodation: "Hotel in Guptkashi",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Guptkashi – Kedarnath",
        description: "Trek to Kedarnath Temple, one of India's most revered Shiva shrines. Evening darshan.",
        activities: ["Trek to Kedarnath (16-18 km)", "Temple darshan", "Mountain views"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Kedarnath – Chopta",
        description: "Trek down and drive to Chopta, the 'Mini Switzerland of India'.",
        activities: ["Trek down", "Drive to Chopta", "Meadow views"],
        accommodation: "Hotel in Chopta",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Chopta – Tungnath – Chopta",
        description: "Trek to Tungnath, highest Shiva temple in the world. Return to Chopta.",
        activities: ["Tungnath trek (3.5 km)", "Temple darshan", "Himalayan views"],
        accommodation: "Hotel in Chopta",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Chopta – Sagar – Trek to Panar",
        description: "Drive to Sagar Village and trek to Panar Bugyal, vast alpine meadow.",
        activities: ["Drive to Sagar", "Trek to Panar (8-10 km)", "Meadow views"],
        accommodation: "Camp at Panar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Panar – Rudranath – Return",
        description: "Trek to mystical Rudranath Temple through forests and meadows. Return to Panar.",
        activities: ["Rudranath trek (18-20 km)", "Temple darshan", "Forest trail"],
        accommodation: "Camp at Panar/Sagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Sagar – Ukhimath – Ransi",
        description: "Drive to Ukhimath and continue to Ransi Village, base for Madhyamaheshwar trek.",
        activities: ["Drive to Ransi", "Mountain views", "Check-in"],
        accommodation: "Hotel in Ransi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Ransi – Madhyamaheshwar",
        description: "Trek through forests and streams to Madhyamaheshwar Temple with serene beauty.",
        activities: ["Trek to Madhyamaheshwar (16-18 km)", "Temple darshan", "Mountain landscapes"],
        accommodation: "Camp at Madhyamaheshwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 9,
        title: "Madhyamaheshwar – Ransi",
        description: "Morning darshan followed by descent to Ransi Village for rest.",
        activities: ["Morning prayers", "Trek down", "Rest"],
        accommodation: "Hotel in Ransi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 10,
        title: "Ransi – Helang – Urgam Valley",
        description: "Drive through scenic roads to peaceful Urgam Valley surrounded by forests.",
        activities: ["Mountain drive", "Valley views", "Traditional villages"],
        accommodation: "Hotel in Urgam",
        meals: "Breakfast, Dinner"
      },
      {
        day: 11,
        title: "Urgam – Kalpeshwar – Pipalkoti",
        description: "Visit Kalpeshwar Temple, last of Panch Kedar shrines. Drive to Pipalkoti.",
        activities: ["Kalpeshwar visit", "Temple darshan", "Drive to Pipalkoti"],
        accommodation: "Hotel in Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 12,
        title: "Pipalkoti – Haridwar/Dehradun (Departure)",
        description: "Return journey with blessings from five sacred Panch Kedar shrines.",
        activities: ["Return drive", "Drop at Haridwar/Dehradun"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation (hotels and camps)",
      "Daily breakfast and dinner",
      "Private vehicle transfers",
      "Trek support staff",
      "All permits",
      "Driver charges",
      "All taxes"
    ],
    exclusions: [
      "Train/flight tickets",
      "Lunch",
      "Pony/porter charges",
      "Personal expenses",
      "Travel insurance",
      "Helicopter charges"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges apply. Trek subject to weather and fitness. No refund for partial cancellation.",
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
