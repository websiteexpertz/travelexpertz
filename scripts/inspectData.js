#!/usr/bin/env node

/**
 * Inspect Package Data
 * This script checks the data in the packages collection to debug the issue
 */

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

async function inspectData() {
  let client = null;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(MONGODB_DB);
    
    // Check packages
    console.log("📦 PACKAGES COLLECTION:");
    console.log("========================");
    const packagesCol = db.collection("packages");
    const totalPackages = await packagesCol.countDocuments({});
    const activePackages = await packagesCol.countDocuments({ active: { $ne: false } });
    const inactivePackages = await packagesCol.countDocuments({ active: false });
    const noActiveField = await packagesCol.countDocuments({ active: { $exists: false } });
    
    console.log(`Total packages: ${totalPackages}`);
    console.log(`Active packages (active !== false): ${activePackages}`);
    console.log(`Inactive packages (active === false): ${inactivePackages}`);
    console.log(`No active field: ${noActiveField}`);
    
    // Show sample package
    console.log("\n📌 Sample Package:");
    const samplePackage = await packagesCol.findOne({});
    console.log(JSON.stringify(samplePackage, null, 2));

    // Check all packages and their active status
    console.log("\n📋 All Packages (active status):");
    const packages = await packagesCol.find({}).project({ title: 1, active: 1 }).toArray();
    packages.forEach((pkg, i) => {
      console.log(`  ${i + 1}. ${pkg.title} (active: ${pkg.active})`);
    });

    // Check inquiries
    console.log("\n\n💬 INQUIRIES COLLECTION:");
    console.log("========================");
    const inquiriesCol = db.collection("package_inquiries");
    const totalInquiries = await inquiriesCol.countDocuments({});
    console.log(`Total inquiries: ${totalInquiries}`);
    
    // Show sample inquiry
    console.log("\n📌 Sample Inquiry:");
    const sampleInquiry = await inquiriesCol.findOne({});
    if (sampleInquiry) {
      console.log(JSON.stringify(sampleInquiry, null, 2));
    } else {
      console.log("No inquiries found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

inspectData();
