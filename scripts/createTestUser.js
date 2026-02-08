const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority";
const DB_NAME = "travelexpertz";

async function createTestUser() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("user_profiles");

    // Hash password - use proper bcryptjs syntax
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash("test123", 10);
    console.log("Password hashed successfully");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("User already exists!");
      return;
    }

    // Create user
    const userResult = await usersCollection.insertOne({
      email: "test@example.com",
      password: hashedPassword,
      mobile: "9876543210",
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("User created with ID:", userResult.insertedId);

    // Create profile
    const profileResult = await profilesCollection.insertOne({
      userId: userResult.insertedId,
      name: "Test User",
      phone: "9876543210",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Profile created with ID:", profileResult.insertedId);
    console.log("Test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: test123");
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await client.close();
  }
}

createTestUser();
