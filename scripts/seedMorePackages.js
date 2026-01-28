import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

const newPackages = [
  {
    title: "Char Dham Yatra – 09 Nights / 10 Days",
    description: "The Char Dham Yatra is a revered spiritual journey through the divine Garhwal Himalayas of Uttarakhand. Covering the four sacred shrines—Yamunotri, Gangotri, Kedarnath, and Badrinath.",
    fullDescription: "This pilgrimage is believed to purify the soul and grant spiritual liberation (moksha). This 10-day itinerary blends devotion, adventure, and the breathtaking beauty of the Himalayas.",
    duration: "9 Nights / 10 Days",
    startingPoint: "Haridwar / Dehradun",
    category: "Pilgrimage Tours",
    badge: "Complete Char Dham",
    image: "/packages/char-dham-yatra.jpg",
    gallery: ["/packages/yamunotri.jpg", "/packages/gangotri.jpg", "/packages/kedarnath-shrine.jpg"],
    price: 42000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar/Dehradun – Barkot",
        description: "Begin your sacred journey from Haridwar or Dehradun. Drive through scenic mountain routes toward Barkot, surrounded by lush valleys and Himalayan vistas.",
        activities: ["Pickup from Haridwar/Dehradun", "Scenic mountain drive", "Check-in at Barkot"],
        accommodation: "Hotel in Barkot",
        meals: "Breakfast, Dinner"
      },
      {
        day: 2,
        title: "Barkot – Yamunotri – Barkot",
        description: "Drive to Janki Chatti and trek to the sacred Yamunotri Temple, the origin of River Yamuna. After darshan, return to Barkot.",
        activities: ["Trek to Yamunotri (5-6 km)", "Yamunotri Temple darshan", "Hot springs visit"],
        accommodation: "Hotel in Barkot",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Barkot – Uttarkashi",
        description: "Drive to Uttarkashi, a spiritual town on the banks of River Bhagirathi. Visit local temples and explore surroundings.",
        activities: ["Drive to Uttarkashi", "Local temple visit", "River Bhagirathi views"],
        accommodation: "Hotel in Uttarkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Uttarkashi – Gangotri – Uttarkashi",
        description: "Early morning drive to Gangotri Temple through picturesque valleys. After prayers, return to Uttarkashi.",
        activities: ["Gangotri Temple darshan", "Valley views", "Forest drive"],
        accommodation: "Hotel in Uttarkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Uttarkashi – Guptkashi",
        description: "Long scenic drive through mountain roads, passing sacred confluences of Devprayag and Rudraprayag.",
        activities: ["Mountain drive", "River confluences", "Himalayan views"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Guptkashi – Kedarnath",
        description: "Drive to Gaurikund and trek to holy Kedarnath Temple, one of the 12 Jyotirlingas. Helicopter option available.",
        activities: ["Trek to Kedarnath (16-18 km)", "Kedarnath Temple darshan", "Mountain views"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Kedarnath – Guptkashi",
        description: "After morning darshan, trek back to Gaurikund and return to Guptkashi to rest.",
        activities: ["Morning darshan", "Trek down", "Return to Guptkashi"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Guptkashi – Badrinath",
        description: "Drive to Badrinath through beautiful mountain landscapes. Attend evening aarti if time permits.",
        activities: ["Drive to Badrinath", "Temple darshan", "Evening aarti"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 9,
        title: "Badrinath – Rudraprayag/Srinagar",
        description: "After morning darshan, visit Mana Village and proceed to Rudraprayag or Srinagar.",
        activities: ["Morning darshan", "Mana Village", "Return journey"],
        accommodation: "Hotel in Rudraprayag/Srinagar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 10,
        title: "Rudraprayag/Srinagar – Haridwar/Dehradun (Departure)",
        description: "Drive back to Haridwar or Dehradun, completing your divine Char Dham Yatra.",
        activities: ["Return drive", "Drop at Haridwar/Dehradun"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Private transport throughout journey",
      "Comfortable hotel/tent accommodations (3-4 sharing)",
      "Pure Veg/Jain full course meals during trek",
      "All entry fees & permits",
      "First aid kit & medical assistance",
      "Expert trip leader",
      "All applicable taxes"
    ],
    exclusions: [
      "Personal expenses",
      "Sightseeing not in package",
      "Travel/medical insurance",
      "Lunch during journey",
      "Horse/Paalki/Helicopter charges",
      "Additional costs due to unforeseen circumstances"
    ],
    importantNotes: [
      "Trekking shoes with good grips required",
      "Carry heavy woollens, thermal wear, raincoats",
      "Mycoderm powder, personal medicines, electrol packets",
      "Valid ID card (Aadhar, License) mandatory"
    ],
    customFields: [],
    refundPolicyNotes: "40% charges if cancelled 30+ days before. 60% charges 15-30 days before. 80% charges 7-15 days before. No refund less than 7 days before check-in.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Char Dham Yatra from Delhi – 11 Nights / 12 Days",
    description: "The most revered pilgrimage in Hinduism, nestled high in the Garhwal Himalayas. This sacred circuit includes Yamunotri, Gangotri, Kedarnath, and Badrinath.",
    fullDescription: "Each shrine is believed to cleanse sins and grant spiritual liberation (moksha). The journey spans 12 days, offering devotion, adventure, and breathtaking landscapes.",
    duration: "11 Nights / 12 Days",
    startingPoint: "Delhi",
    category: "Pilgrimage Tours",
    badge: "Premium Char Dham",
    image: "/packages/char-dham-complete.jpg",
    gallery: ["/packages/yamunotri-temple.jpg", "/packages/gangotri-view.jpg", "/packages/badrinath-panorama.jpg"],
    price: 48000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Delhi to Haridwar",
        description: "Journey begins from Delhi. Drive to Haridwar and witness the mesmerizing Ganga Aarti at Har Ki Pauri.",
        activities: ["Drive to Haridwar", "Ganga Aarti", "Ghat exploration"],
        accommodation: "Hotel in Haridwar",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Haridwar to Barkot",
        description: "Drive to Barkot with mesmerizing views of rolling hills, valleys, and Himalayan landscapes.",
        activities: ["Mountain drive", "Valley views", "Check-in at Barkot"],
        accommodation: "Hotel in Barkot",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Barkot – Yamunotri – Barkot",
        description: "Trek to Yamunotri Temple, the source of River Yamuna. After darshan, return to Barkot.",
        activities: ["Trek to Yamunotri", "Temple darshan", "Hot springs"],
        accommodation: "Hotel in Barkot",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Barkot to Uttarkashi",
        description: "Travel to Uttarkashi on the banks of Bhagirathi River. Explore local temples.",
        activities: ["Drive to Uttarkashi", "Temple visits", "River views"],
        accommodation: "Hotel in Uttarkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Uttarkashi – Gangotri – Uttarkashi",
        description: "Early morning drive to Gangotri through pine forests and valleys. Offer prayers and return.",
        activities: ["Gangotri Temple darshan", "Pine forest drive", "Valley views"],
        accommodation: "Hotel in Uttarkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Uttarkashi to Guptkashi",
        description: "Long scenic drive passing Devprayag and Rudraprayag confluences.",
        activities: ["Mountain drive", "Sacred confluences", "Himalayan views"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 7,
        title: "Guptkashi to Kedarnath",
        description: "Drive to Gaurikund and trek to divine Kedarnath Temple. Helicopter option available.",
        activities: ["Trek to Kedarnath", "Temple darshan", "Mountain peaks"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 8,
        title: "Kedarnath to Guptkashi",
        description: "After morning darshan, trek back and return to Guptkashi for restful night.",
        activities: ["Morning darshan", "Trek down", "Return drive"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 9,
        title: "Guptkashi to Badrinath",
        description: "Drive through beautiful mountains to Badrinath. Visit temple and attend evening aarti.",
        activities: ["Drive to Badrinath", "Temple visit", "Evening aarti"],
        accommodation: "Hotel in Badrinath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 10,
        title: "Badrinath to Rudraprayag",
        description: "After morning darshan, visit Mana Village and proceed to Rudraprayag.",
        activities: ["Morning darshan", "Mana Village", "Return drive"],
        accommodation: "Hotel in Rudraprayag",
        meals: "Breakfast, Dinner"
      },
      {
        day: 11,
        title: "Rudraprayag to Haridwar",
        description: "Drive back to Haridwar for evening relaxation.",
        activities: ["Return to Haridwar", "Evening leisure"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 12,
        title: "Haridwar to Delhi (Departure)",
        description: "Return to Delhi with divine blessings and lifetime memories.",
        activities: ["Return to Delhi", "Drop at airport/station"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Private transport throughout",
      "Hotel/tent accommodations (3-4 sharing)",
      "Pure Veg/Jain meals during trek",
      "All entry fees & permits",
      "First aid & medical assistance",
      "Expert trip leader",
      "All taxes"
    ],
    exclusions: [
      "Personal expenses",
      "Insurance",
      "Lunch during journey",
      "Horse/helicopter charges",
      "Anything not in inclusions"
    ],
    importantNotes: [
      "Carry trekking shoes, thermal wear, raincoat",
      "Photo ID mandatory",
      "Personal medicines required",
      "Full payment 15 days before trip"
    ],
    customFields: [],
    refundPolicyNotes: "Before 45 days: 50% refund. 30-20 days: 25% refund. After 10 days: No refund.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Hemkund Sahib Yatra – 05 Nights / 06 Days",
    description: "A journey blending nature, devotion, and adventure to the sacred Hemkund Sahib, one of Sikhism's highest and holiest shrines, located at 4,329 meters altitude.",
    fullDescription: "Experience vibrant alpine meadows, snow-capped peaks, spiritual serenity, and Himalayan beauty over this unforgettable pilgrimage.",
    duration: "5 Nights / 6 Days",
    startingPoint: "Haridwar",
    category: "Pilgrimage Tours",
    badge: "Sacred Journey",
    image: "/packages/hemkund-sahib.jpg",
    gallery: ["/packages/hemkund-lake.jpg", "/packages/ghangaria.jpg"],
    price: 28000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar – Joshimath/Pipalkoti",
        description: "Drive through Devprayag, Srinagar, Rudraprayag, and Karnaprayag—four holy confluences of Uttarakhand.",
        activities: ["Drive through confluences", "Mountain views", "Check-in"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Joshimath/Pipalkoti – Govindghat – Ghangaria",
        description: "Drive to Govindghat and trek to Ghangaria through lush forests and waterfalls along Pushpawati River.",
        activities: ["Trek to Ghangaria (9-10 km)", "Forest trail", "River views"],
        accommodation: "Hotel in Ghangaria",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Ghangaria – Hemkund Sahib – Return",
        description: "Steep trek to Hemkund Sahib. Visit Gurudwara, take holy dip in icy lake, and meditate. Return to Ghangaria.",
        activities: ["Trek to Hemkund (6 km uphill)", "Gurudwara darshan", "Holy dip"],
        accommodation: "Hotel in Ghangaria",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Ghangaria – Govindghat – Joshimath/Pipalkoti",
        description: "Trek down to Govindghat and drive back. Evening free for relaxation or local market.",
        activities: ["Trek down", "Drive back", "Local exploration"],
        accommodation: "Hotel in Joshimath/Pipalkoti",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Joshimath/Pipalkoti – Haridwar",
        description: "Return journey to Haridwar with picturesque river valleys and mountain views.",
        activities: ["Return drive", "Scenic views", "Check-in at Haridwar"],
        accommodation: "Hotel in Haridwar",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Haridwar – Departure",
        description: "Morning relaxation by ghats or local market before departure.",
        activities: ["Ghat visit", "Local markets", "Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "All transfers by private vehicle",
      "Driver charges and fuel",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train tickets",
      "Lunch and beverages",
      "Personal expenses",
      "Travel insurance",
      "Pony/porter charges"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies. Weather-dependent trek subject to conditions.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Jaipur – Ajmer – Pushkar Heritage Tour",
    description: "Discover the royal charm, spiritual heritage, and cultural richness of Rajasthan. This tour blends Jaipur's grandeur with Ajmer Sharif's sacred vibes and Pushkar's tranquil lakeside beauty.",
    fullDescription: "Experience magnificent forts, palaces, temples, and the vibrant culture of the Pink City and holy towns.",
    duration: "3 Days / 2 Nights",
    startingPoint: "Jaipur",
    category: "Cultural Tours",
    badge: "Heritage",
    image: "/packages/jaipur-palace.jpg",
    gallery: ["/packages/amber-fort.jpg", "/packages/ajmer-dargah.jpg", "/packages/pushkar-lake.jpg"],
    price: 12000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Jaipur – Local Sightseeing",
        description: "Explore the Pink City covering Amber Fort, Jal Mahal, City Palace, Jantar Mantar, and Hawa Mahal.",
        activities: ["Amber Fort", "City Palace", "Jantar Mantar", "Hawa Mahal", "Local bazaar"],
        accommodation: "Hotel in Jaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 2,
        title: "Jaipur – Ajmer – Pushkar",
        description: "Visit Ajmer Sharif Dargah and proceed to Pushkar for Brahma Temple and Pushkar Lake.",
        activities: ["Ajmer Sharif", "Brahma Temple", "Pushkar Lake", "Local markets"],
        accommodation: "Hotel in Pushkar/Ajmer",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Pushkar – Jaipur (Departure)",
        description: "Return to Jaipur and transfer to airport/railway station.",
        activities: ["Return drive", "Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "2 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Monument entrance fees",
      "Local guide",
      "Government taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Personal expenses",
      "Optional activities",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per company policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Jaipur – Udaipur Royal Experience",
    description: "Discover the regal charm of Rajasthan from the Pink City of Jaipur to the romantic Lake City of Udaipur. Explore grand forts, royal palaces, and serene lakes.",
    fullDescription: "Experience the rich heritage and timeless elegance of Rajasthan with colorful bazaars and stunning architecture.",
    duration: "4 Days / 3 Nights",
    startingPoint: "Jaipur",
    category: "Cultural Tours",
    badge: "Popular",
    image: "/packages/udaipur-palace.jpg",
    gallery: ["/packages/jaipur-fort.jpg", "/packages/lake-pichola.jpg"],
    price: 18000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Jaipur – Local Sightseeing",
        description: "Explore City Palace, Jantar Mantar, and Hawa Mahal. Evening at local bazaars.",
        activities: ["City Palace", "Jantar Mantar", "Hawa Mahal", "Shopping"],
        accommodation: "Hotel in Jaipur",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Jaipur – Amber Fort & Transfer to Udaipur",
        description: "Visit Amber Fort and drive to Udaipur with scenic countryside views.",
        activities: ["Amber Fort", "Scenic drive", "Check-in Udaipur"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Udaipur Sightseeing",
        description: "Explore City Palace, Jag Mandir, Saheliyon Ki Bari, and Jagadeesh Temple. Optional boat ride.",
        activities: ["City Palace", "Jag Mandir", "Lake Pichola boat ride", "Gardens"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Udaipur – Departure",
        description: "Transfer to airport/railway station after breakfast.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "3 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Monument entrance fees",
      "Local guide",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Personal expenses",
      "Optional boat ride",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation charges apply.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Royal Rajasthan Heritage Trail – Jaipur, Jodhpur, Udaipur",
    description: "Uncover royal essence of Rajasthan through the Pink City, Blue City, and Lake City. Experience majestic forts, palaces, vibrant bazaars, and serene lakes.",
    fullDescription: "A truly timeless journey through Rajasthan's most iconic destinations with complete cultural immersion.",
    duration: "5 Days / 4 Nights",
    startingPoint: "Jaipur",
    category: "Cultural Tours",
    badge: "Bestseller",
    image: "/packages/rajasthan-tour.jpg",
    gallery: ["/packages/mehrangarh.jpg", "/packages/city-palace-udaipur.jpg"],
    price: 25000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Jaipur – Local Sightseeing",
        description: "Explore City Palace, Jantar Mantar, Hawa Mahal, and local bazaars.",
        activities: ["City Palace", "Jantar Mantar", "Hawa Mahal", "Shopping"],
        accommodation: "Hotel in Jaipur",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Jaipur – Amber Fort & Transfer to Jodhpur",
        description: "Visit Amber Fort and drive to Jodhpur, the Blue City.",
        activities: ["Amber Fort", "Drive to Jodhpur", "Evening leisure"],
        accommodation: "Hotel in Jodhpur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Jodhpur Sightseeing – Transfer to Udaipur",
        description: "Explore Mehrangarh Fort, Jaswant Thada, Umaid Bhawan Palace. Drive to Udaipur.",
        activities: ["Mehrangarh Fort", "Jaswant Thada", "Umaid Bhawan", "Drive to Udaipur"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Udaipur Sightseeing",
        description: "Visit City Palace, Jag Mandir, Saheliyon Ki Bari, Jagadeesh Temple. Optional boat ride.",
        activities: ["City Palace", "Jag Mandir", "Gardens", "Boat ride"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Udaipur – Departure",
        description: "Transfer to airport/railway station after breakfast.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "4 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Monument entrance fees",
      "Local guide",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Personal expenses",
      "Optional activities",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Grand Rajasthan Tour – Jaipur, Jodhpur, Udaipur, Jaisalmer",
    description: "Explore the soul of Rajasthan covering royal palaces, mighty forts, romantic lakes, and golden sand dunes. A perfect blend of history, culture, and desert adventure.",
    fullDescription: "From Jaipur's grandeur to Jaisalmer's golden dunes, experience complete Rajasthan.",
    duration: "6 Days / 5 Nights",
    startingPoint: "Jaipur",
    category: "Cultural Tours",
    badge: "Complete Rajasthan",
    image: "/packages/jaisalmer-fort.jpg",
    gallery: ["/packages/sam-dunes.jpg", "/packages/jodhpur-blue.jpg"],
    price: 32000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Jaipur – Local Sightseeing",
        description: "Explore City Palace, Jantar Mantar, Hawa Mahal and local bazaars.",
        activities: ["City Palace", "Jantar Mantar", "Hawa Mahal", "Shopping"],
        accommodation: "Hotel in Jaipur",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Jaipur – Amber Fort & Transfer to Jodhpur",
        description: "Visit Amber Fort and drive to Blue City Jodhpur.",
        activities: ["Amber Fort", "Drive to Jodhpur"],
        accommodation: "Hotel in Jodhpur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Jodhpur Sightseeing – Transfer to Udaipur",
        description: "Visit Mehrangarh Fort, Jaswant Thada, Umaid Bhawan. Drive to Udaipur.",
        activities: ["Mehrangarh Fort", "Jaswant Thada", "Drive to Udaipur"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Udaipur Sightseeing",
        description: "Explore City Palace, Jag Mandir, gardens and temples. Optional boat ride.",
        activities: ["City Palace", "Jag Mandir", "Lake Pichola", "Boat ride"],
        accommodation: "Hotel in Udaipur",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Udaipur – Jaisalmer",
        description: "Drive to Golden City Jaisalmer through changing desert landscapes.",
        activities: ["Long drive", "Desert views", "Check-in"],
        accommodation: "Hotel/Desert Camp in Jaisalmer",
        meals: "Breakfast, Dinner"
      },
      {
        day: 6,
        title: "Jaisalmer Sightseeing – Departure",
        description: "Visit Jaisalmer Fort, Havelis, Gadisar Lake. Camel safari at Sam Sand Dunes. Departure.",
        activities: ["Jaisalmer Fort", "Patwon Ki Haveli", "Camel safari", "Folk performance"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "5 Nights accommodation/desert camp",
      "Daily breakfast",
      "Private AC vehicle",
      "Camel safari & cultural program",
      "Monument fees",
      "Local guide",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Personal expenses",
      "Optional activities",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy applies.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Royal Rajasthan Desert & Heritage Tour – Jodhpur to Jaisalmer",
    description: "Experience Royal Rajasthan where mighty forts, golden sand dunes, vibrant bazaars, and desert culture unite. From Blue City to Golden City.",
    fullDescription: "Perfect blend of history, heritage, desert adventure, and local traditions in royal Rajasthan.",
    duration: "4 Days / 3 Nights",
    startingPoint: "Jodhpur",
    category: "Cultural Tours",
    badge: "Desert Experience",
    image: "/packages/desert-rajasthan.jpg",
    gallery: ["/packages/mehrangarh-view.jpg", "/packages/camel-safari.jpg"],
    price: 20000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival at Jodhpur – Local Sightseeing",
        description: "Explore Mehrangarh Fort, Jaswant Thada, Umaid Bhawan Palace. Evening at Clock Tower & Sardar Market.",
        activities: ["Mehrangarh Fort", "Jaswant Thada", "Umaid Bhawan", "Local market"],
        accommodation: "Hotel in Jodhpur",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Jodhpur – Jaisalmer",
        description: "Scenic drive to Golden City showcasing rural Rajasthan and desert landscapes.",
        activities: ["Drive to Jaisalmer", "Desert views", "Check-in"],
        accommodation: "Hotel in Jaisalmer",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Jaisalmer Sightseeing & Desert Safari",
        description: "Visit Jaisalmer Fort, Havelis, Gadisar Lake. Evening camel safari with folk performance.",
        activities: ["Jaisalmer Fort", "Patwon Ki Haveli", "Camel safari", "Cultural program", "Desert dinner"],
        accommodation: "Desert Camp/Hotel",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Departure from Jaisalmer",
        description: "Transfer to airport/railway station after breakfast.",
        activities: ["Departure"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "3 Nights accommodation/desert camp",
      "Daily breakfast",
      "Private AC vehicle",
      "Camel safari & cultural program",
      "Monument entrance fees",
      "Local guide",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners (except desert camp)",
      "Personal expenses",
      "Optional activities",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Cancellation charges as per company policy.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Kasol–Manali Himalayan Adventure Tour",
    description: "Perfect blend of nature, spirituality, and adventure in Himachal Pradesh. Covers Kasol's peaceful vibes, sacred Manikaran, complete Manali sightseeing, Solang Valley, Rohtang Pass, and Atal Tunnel.",
    fullDescription: "Experience riverside cafés, hot springs, ancient temples, adventure activities, and breathtaking Himalayan landscapes.",
    duration: "5 Days / 4 Nights",
    startingPoint: "Chandigarh / Delhi",
    category: "Adventure Tours",
    badge: "Adventure",
    image: "/packages/manali-adventure.jpg",
    gallery: ["/packages/kasol-river.jpg", "/packages/solang-valley.jpg", "/packages/rohtang-pass.jpg"],
    price: 22000,
    currency: "INR",
    featured: true,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival – Transfer to Kasol",
        description: "Scenic drive to Kasol along Beas and Parvati rivers. Evening at Kasol Market and riverside cafés.",
        activities: ["Scenic drive", "Kasol Market", "Riverside walk"],
        accommodation: "Hotel in Kasol",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Kasol – Manikaran – Transfer to Manali",
        description: "Visit Manikaran Sahib Gurudwara with hot springs and temple. Drive to Manali.",
        activities: ["Manikaran Sahib", "Hot springs", "Drive to Manali", "Mall Road"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Manali Local Sightseeing",
        description: "Explore Hadimba Temple, Vashisht Hot Springs, Manu Temple, Van Vihar, Tibetan Monastery.",
        activities: ["Hadimba Temple", "Vashisht Springs", "Manu Temple", "Van Vihar", "Monastery"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Solang Valley & Atal Tunnel Excursion",
        description: "Visit Solang Valley for paragliding, zorbing, skiing. Drive through Atal Tunnel.",
        activities: ["Solang Valley", "Adventure activities", "Atal Tunnel", "Snow activities"],
        accommodation: "Hotel in Manali",
        meals: "Breakfast, Dinner"
      },
      {
        day: 5,
        title: "Rohtang Pass Excursion – Departure",
        description: "Early morning visit to Rohtang Pass (subject to permit). Transfer to Chandigarh/Delhi.",
        activities: ["Rohtang Pass", "Snow activities", "Return journey"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "4 Nights accommodation",
      "Daily breakfast",
      "Private AC vehicle",
      "Complete Manali sightseeing",
      "Solang Valley excursion",
      "All taxes"
    ],
    exclusions: [
      "Airfare/train fare",
      "Lunches and dinners",
      "Rohtang Pass permit & local cab",
      "Adventure activities",
      "Personal expenses",
      "Travel insurance"
    ],
    customFields: [],
    refundPolicyNotes: "Standard cancellation policy. Rohtang Pass subject to weather and permit.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Kedarnath Yatra from Haridwar & Dehradun",
    description: "Kedarnath is one of the holiest shrines of Lord Shiva and a key part of Char Dham Yatra, located at 3,583 meters altitude in Uttarakhand.",
    fullDescription: "Surrounded by majestic Garhwal Himalayas near Mandakini River, offering deeply spiritual and scenic experience.",
    duration: "3 Nights / 4 Days",
    startingPoint: "Haridwar / Dehradun",
    category: "Pilgrimage Tours",
    badge: "Quick Pilgrimage",
    image: "/packages/kedarnath-dham.jpg",
    gallery: ["/packages/kedarnath-valley.jpg", "/packages/gaurikund.jpg"],
    price: 16000,
    currency: "INR",
    featured: false,
    active: true,
    itinerary: [
      {
        day: 1,
        title: "Haridwar/Dehradun – Guptkashi",
        description: "Travel through mountains, valleys, and Himalayan towns. Visit Vishwanath Temple with Chaukhamba peak views.",
        activities: ["Mountain drive", "Temple visit", "Chaukhamba views"],
        accommodation: "Hotel in Guptkashi",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Guptkashi – Kedarnath",
        description: "Drive to Gaurikund and trek to Kedarnath Temple, one of 12 Jyotirlingas. Helicopter option available.",
        activities: ["Trek to Kedarnath (16-18 km)", "Temple darshan", "Valley views"],
        accommodation: "Hotel in Kedarnath",
        meals: "Breakfast, Dinner"
      },
      {
        day: 3,
        title: "Kedarnath – Guptkashi",
        description: "Early morning temple visit, trek down and return to Guptkashi for rest.",
        activities: ["Morning darshan", "Trek down", "Return drive"],
        accommodation: "Hotel in Guptkashi",
        meals: "Breakfast, Dinner"
      },
      {
        day: 4,
        title: "Guptkashi – Haridwar/Dehradun",
        description: "Return journey with scenic landscapes and river confluences.",
        activities: ["Return drive", "Scenic views", "Drop at Haridwar/Dehradun"],
        accommodation: "N/A",
        meals: "Breakfast"
      }
    ],
    inclusions: [
      "Accommodation on sharing basis",
      "Daily breakfast and dinner",
      "Private vehicle transfers",
      "Driver and fuel charges",
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
