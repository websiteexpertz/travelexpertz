#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * This script verifies that MongoDB is properly configured and accessible
 * Run with: node scripts/testMongoConnection.js
 */

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

async function testConnection() {
  if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is not set");
    process.exit(1);
  }

  console.log("🔍 Testing MongoDB connection...");
  console.log(`📍 Database: ${MONGODB_DB}`);

  let client = null;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 5000,
    });

    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully!");

    const db = client.db(MONGODB_DB);
    
    // Check collections
    console.log("\n📦 Checking collections...");
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }

    // Check specific collections
    console.log("\n🎯 Checking critical collections:");
    const criticalCollections = ["packages", "package_inquiries", "destinations", "hotels", "homestays"];
    
    for (const collName of criticalCollections) {
      try {
        const count = await db.collection(collName).countDocuments();
        console.log(`  ✅ ${collName}: ${count} documents`);
      } catch (err) {
        console.log(`  ⚠️  ${collName}: Collection not found or error occurred`);
      }
    }

    console.log("\n✅ MongoDB connection test PASSED!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ MongoDB connection test FAILED!");
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("\n💡 Suggestion: Check your internet connection and MongoDB Atlas network access.");
      console.error("   - Ensure your IP is whitelisted in MongoDB Atlas");
      console.error("   - Check if MongoDB Atlas cluster is running");
    } else if (error.message.includes("authentication failed")) {
      console.error("\n💡 Suggestion: Check your MongoDB credentials in .env.local");
      console.error(`   - Username and password in MONGODB_URI`);
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testConnection();
