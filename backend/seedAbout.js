import mongoose from "mongoose";
import dotenv from "dotenv";
import { About } from "./src/models/about.js";

dotenv.config({ path: ".env.local" });

const aboutData = [
  // Hero Section
  {
    section: "hero",
    title: "About TravelExpertz",
    subtitle:
      "Your trusted partner in creating unforgettable travel experiences around the world",
    order: 0,
    active: true,
  },
  // Story Section
  {
    section: "story",
    title: "Our Story",
    content:
      "Founded with a passion for exploration and a commitment to excellence, TravelExpertz has been helping travelers discover the world's most amazing destinations for over a decade.\n\nWe believe that travel is more than just visiting new places—it's about creating memories, experiencing cultures, and connecting with people from around the globe.\n\nOur team of expert travel consultants brings years of experience and firsthand knowledge to help you plan the perfect trip, whether it's a romantic getaway, family vacation, or solo adventure.",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop",
    order: 0,
    active: true,
  },
  // Mission
  {
    section: "mission",
    title: "Our Mission",
    icon: "🎯",
    content:
      "To provide exceptional travel experiences that exceed expectations, offering personalized service, competitive prices, and expert guidance every step of the way.",
    order: 0,
    active: true,
  },
  // Vision
  {
    section: "vision",
    title: "Our Vision",
    icon: "👁️",
    content:
      "To become the world's most trusted travel partner, inspiring people to explore, discover, and create lasting memories through transformative travel experiences.",
    order: 0,
    active: true,
  },
  // Core Values
  {
    section: "values",
    title: "Excellence",
    icon: "✨",
    description: "We strive for excellence in every aspect of our service",
    order: 0,
    active: true,
  },
  {
    section: "values",
    title: "Trust",
    icon: "🤝",
    description:
      "Building lasting relationships based on trust and transparency",
    order: 1,
    active: true,
  },
  {
    section: "values",
    title: "Innovation",
    icon: "💡",
    description: "Constantly evolving to bring you the best travel solutions",
    order: 2,
    active: true,
  },
  {
    section: "values",
    title: "Passion",
    icon: "❤️",
    description: "Our love for travel drives everything we do",
    order: 3,
    active: true,
  },
  // Statistics
  {
    section: "statistics",
    number: "50,000+",
    label: "Happy Travelers",
    order: 0,
    active: true,
  },
  {
    section: "statistics",
    number: "150+",
    label: "Destinations",
    order: 1,
    active: true,
  },
  {
    section: "statistics",
    number: "10+",
    label: "Years Experience",
    order: 2,
    active: true,
  },
  {
    section: "statistics",
    number: "4.9/5",
    label: "Average Rating",
    order: 3,
    active: true,
  },
  // Team Members
  {
    section: "team",
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    order: 0,
    active: true,
  },
  {
    section: "team",
    name: "Michael Chen",
    role: "Head of Operations",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    order: 1,
    active: true,
  },
  {
    section: "team",
    name: "Emily Rodriguez",
    role: "Senior Travel Consultant",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    order: 2,
    active: true,
  },
  {
    section: "team",
    name: "David Patel",
    role: "Customer Success Manager",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    order: 3,
    active: true,
  },
];

const seedAbout = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing about data
    await About.deleteMany({});
    console.log("Cleared existing about data");

    // Insert new data
    await About.insertMany(aboutData);
    console.log("About data seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding about data:", error);
    process.exit(1);
  }
};

seedAbout();
