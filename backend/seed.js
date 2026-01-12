import mongoose from "mongoose";
import { Testimonial } from "./src/models/testimonial.js";
import { FAQ } from "./src/models/faq.js";
import { Service } from "./src/models/service.js";
import { Package } from "./src/models/package.js";
import { WhyUs } from "./src/models/whyus.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const seedTestimonials = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/travelexpertz";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected for seeding...");

    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log("Cleared existing testimonials");

    // Seed new testimonials
    const testimonials = [
      {
        name: "Sarah Johnson",
        location: "New York, USA",
        image: "/testimonials/1.svg",
        rating: 5,
        text: "TravelExpertz made my vacation planning so easy! The service is amazing and prices are unbeatable.",
        verified: true,
      },
      {
        name: "Raj Patel",
        location: "Mumbai, India",
        image: "/testimonials/2.svg",
        rating: 5,
        text: "I love the seamless booking experience. The customer support team helped me with all my queries.",
        verified: true,
      },
      {
        name: "Emma Williams",
        location: "London, UK",
        image: "/testimonials/3.svg",
        rating: 5,
        text: "Best travel platform I have used. Great deals and reliable service throughout my journey.",
        verified: true,
      },
      {
        name: "Marco Chen",
        location: "Singapore",
        image: "/testimonials/1.svg",
        rating: 5,
        text: "Excellent user interface and fantastic customer support. Highly recommended for all travel needs!",
        verified: true,
      },
      {
        name: "Anna Rodriguez",
        location: "Madrid, Spain",
        image: "/testimonials/2.svg",
        rating: 5,
        text: "The best travel booking website I've ever used. Fast, reliable, and affordable prices!",
        verified: true,
      },
      {
        name: "David Thompson",
        location: "Sydney, Australia",
        image: "/testimonials/3.svg",
        rating: 5,
        text: "Outstanding service and amazing deals! TravelExpertz has become my go-to platform for all travel bookings.",
        verified: true,
      },
    ];

    const createdTestimonials = await Testimonial.insertMany(testimonials);
    console.log(`${createdTestimonials.length} testimonials seeded successfully`);

    // Clear and seed FAQs
    await FAQ.deleteMany({});
    console.log("Cleared existing FAQs");

    const faqs = [
      {
        question: "How do I book a flight?",
        answer: "Simply enter your departure and destination cities, select your travel dates, and browse available flights. Compare prices and book your preferred flight with just a few clicks.",
        category: "Booking",
        order: 1,
        active: true,
      },
      {
        question: "Can I modify or cancel my booking?",
        answer: "Yes, most bookings can be modified or cancelled through your account. Cancellation policies vary by booking type. Check the terms and conditions of your specific booking for details.",
        category: "Booking",
        order: 2,
        active: true,
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, net banking, and digital wallets. All transactions are secure and encrypted.",
        category: "Payment",
        order: 3,
        active: true,
      },
      {
        question: "Is there a refund policy?",
        answer: "Refund eligibility depends on your booking terms. Some bookings are non-refundable while others allow refunds. Check your booking confirmation for specific refund policies.",
        category: "Refunds",
        order: 4,
        active: true,
      },
      {
        question: "How can I contact customer support?",
        answer: "You can reach our customer support team 24/7 via email, phone, or live chat on our website. We're here to help with any questions or concerns.",
        category: "Support",
        order: 5,
        active: true,
      },
      {
        question: "Do you offer travel insurance?",
        answer: "Yes, we offer comprehensive travel insurance options during checkout. Travel insurance protects you against unexpected trip cancellations, medical emergencies, and baggage issues.",
        category: "Insurance",
        order: 6,
        active: true,
      },
    ];

    const createdFAQs = await FAQ.insertMany(faqs);
    console.log(`${createdFAQs.length} FAQs seeded successfully`);

    // Clear and seed Services
    await Service.deleteMany({});
    console.log("Cleared existing services");

    const services = [
      {
        icon: "✈️",
        title: "Flight Ticket",
        description: "Book your flights with the best prices and offers worldwide",
        href: "/flights",
        image: "/flight-ticket.png",
        order: 1,
        active: true,
      },
      {
        icon: "🚌",
        title: "Bus Ticket",
        description: "Reserve comfortable bus journeys across all major routes",
        href: "/bus",
        image: "/bus-ticket.png",
        order: 2,
        active: true,
      },
      {
        icon: "🚕",
        title: "Cab",
        description: "Get reliable cab services for convenient travel",
        href: "/cab",
        image: "/cab.png",
        order: 3,
        active: true,
      },
      {
        icon: "🎫",
        title: "Tour Packages",
        description: "Explore exciting tour packages and holiday deals",
        href: "/tours",
        image: "/tour-packages.png",
        order: 4,
        active: true,
      },
      {
        icon: "🚆",
        title: "Train Ticket",
        description: "Book trains for a comfortable and affordable journey",
        href: "/trains",
        image: "/train-ticket.png",
        order: 5,
        active: true,
      },
      {
        icon: "🛂",
        title: "Visa",
        description: "Get visa assistance and travel documentation support",
        href: "/visas",
        image: "/visa.png",
        order: 6,
        active: true,
      },
      {
        icon: "💳",
        title: "Forex & Currency",
        description: "Exchange currencies with competitive rates and offers",
        href: "/forex",
        image: "/forex-card-and-currency .png",
        order: 7,
        active: true,
      },
      {
        icon: "🛡️",
        title: "Travel Insurance",
        description: "Protect your travels with comprehensive insurance plans",
        href: "/insurance",
        image: "/travel-insurance.png",
        order: 8,
        active: true,
      },
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`${createdServices.length} services seeded successfully`);

    // Seed packages
    const packages = [
      {
        title: "Char Dham Yatra",
        description: "Sacred pilgrimage to four holy Hindu temples",
        fullDescription: "Experience the ultimate spiritual journey to the four most sacred pilgrimage sites in the Indian Himalayas. This 12-day Char Dham Yatra includes visits to Yamunotri, Gangotri, Kedarnath, and Badrinath temples, each nestled in the breathtaking landscape of the Garhwal Himalayas.",
        image: "/char-dhamimage.png",
        price: 1499,
        currency: "USD",
        duration: "12 Days",
        location: "Delhi to Delhi",
        highlights: [
          "Visit all 4 sacred temples in one journey",
          "Experience pristine Himalayan mountain scenery",
          "Guided pilgrimage at each holy site",
          "Comfortable stay in spiritual towns",
          "Traditional local cuisine and culture",
          "Expert pilgrim guides throughout"
        ],
        itinerary: [
          {
            day: 1,
            title: "Arrival in Delhi",
            description: "Arrive at Delhi airport. Meet our guide and transfer to hotel. Evening orientation and briefing about the Char Dham pilgrimage. Overnight stay in Delhi."
          },
          {
            day: 2,
            title: "Delhi to Mussoorie",
            description: "Drive to Mussoorie (6 hours). Check-in at hotel. Evening walk on Mall Road with scenic views of the Himalayas. Overnight in Mussoorie."
          },
          {
            day: 3,
            title: "Mussoorie to Yamunotri",
            description: "Journey to Yamunotri, the source of River Yamuna. Trek 5 km to reach the temple. Visit the hot spring and sacred shrine. Overnight stay in Yamunotri."
          },
          {
            day: 4,
            title: "Yamunotri to Gangotri",
            description: "Travel to Gangotri, the source of River Ganga. Visit the Gangotri Temple dedicated to Goddess Ganga. Trek to the riverside for sacred rituals. Overnight in Gangotri."
          },
          {
            day: 5,
            title: "Rest Day in Gangotri",
            description: "Acclimatization day. Optional trek to nearby areas. Participate in evening Aarti at the temple. Meditation and relaxation."
          },
          {
            day: 6,
            title: "Gangotri to Kedarnath",
            description: "Drive to Gaurikund and trek to Kedarnath Temple (16 km scenic trek). Visit the sacred Kedarnath Temple dedicated to Lord Shiva. Overnight stay in Kedarnath."
          },
          {
            day: 7,
            title: "Kedarnath to Guptkashi",
            description: "Descend from Kedarnath to Gaurikund. Drive to Guptkashi. Rest and preparation for next destination. Overnight in Guptkashi."
          },
          {
            day: 8,
            title: "Guptkashi to Badrinath",
            description: "Travel to Badrinath, the holiest Vishnu temple in the Himalayas. Evening Aarti at Badrinath Temple. Visit Narada Kund and Tapt Kund hot springs. Overnight in Badrinath."
          },
          {
            day: 9,
            title: "Badrinath Exploration",
            description: "Full day in Badrinath. Visit Brahma Kapal, Charan Paduka, and surrounding temples. Trek to nearby scenic spots. Participate in morning Aarti rituals."
          },
          {
            day: 10,
            title: "Badrinath to Auli",
            description: "Drive to Auli, India's first ski resort. Enjoy panoramic views of the Himalayas. Cable car ride (if operational). Nature walk. Overnight in Auli."
          },
          {
            day: 11,
            title: "Auli to Delhi",
            description: "Begin journey back to Delhi. Stop at Rishikesh for evening Ganga Aarti. Overnight in Delhi."
          },
          {
            day: 12,
            title: "Departure from Delhi",
            description: "Final morning at leisure. Transfer to Delhi airport for departure with blessed memories of your sacred pilgrimage."
          }
        ],
        inclusions: [
          "Accommodation in 2-3 star hotels throughout",
          "All meals (breakfast, lunch, dinner)",
          "Experienced pilgrimage guide",
          "All road transportation in comfortable vehicles",
          "Temple entry fees",
          "Travel insurance",
          "Welcome and farewell dinner"
        ],
        exclusions: [
          "International and domestic flights",
          "Tips and gratuities",
          "Personal expenses",
          "Adventure activities beyond trekking",
          "Travel insurance beyond standard coverage",
          "Meals in the itinerary not specified"
        ],
        bestTime: "May to October",
        difficulty: "Moderate",
        groupSize: "4-12 people",
        featured: true,
        active: true
      }
    ];

    const createdPackages = await Package.insertMany(packages);
    console.log(`${createdPackages.length} packages seeded successfully`);

    // Clear and seed Why Us
    await WhyUs.deleteMany({});
    console.log("Cleared existing Why Us entries");

    const whyUs = [
      {
        icon: "workspace_premium",
        title: "Best Price Guarantee",
        description: "Find the best deals and save more on your bookings with our competitive pricing.",
        order: 1,
        active: true
      },
      {
        icon: "support_agent",
        title: "24/7 Support",
        description: "Our dedicated support team is available around the clock to assist you with any queries.",
        order: 2,
        active: true
      },
      {
        icon: "verified_user",
        title: "Verified Properties",
        description: "We ensure all our listed properties are verified for quality, safety, and comfort.",
        order: 3,
        active: true
      },
      {
        icon: "touch_app",
        title: "Seamless Booking",
        description: "Enjoy a hassle-free booking experience with our easy-to-use platform.",
        order: 4,
        active: true
      }
    ];

    const createdWhyUs = await WhyUs.insertMany(whyUs);
    console.log(`${createdWhyUs.length} Why Us entries seeded successfully`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedTestimonials();
