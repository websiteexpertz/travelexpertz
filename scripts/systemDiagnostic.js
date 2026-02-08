#!/usr/bin/env node

/**
 * Complete System Diagnostic
 * Checks MongoDB, API endpoints, and data integrity
 * Run with: node scripts/systemDiagnostic.js
 */

const { MongoClient } = require("mongodb");
const http = require("http");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

async function testMongoDB() {
  let client = null;
  try {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const packagesCount = await db.collection("packages").countDocuments({});
    const inquiriesCount = await db.collection("package_inquiries").countDocuments({});
    
    return {
      status: "✅ OK",
      packages: packagesCount,
      inquiries: inquiriesCount,
      connection: "Connected"
    };
  } catch (error) {
    return {
      status: "❌ ERROR",
      error: error.message,
      connection: "Failed"
    };
  } finally {
    if (client) await client.close();
  }
}

function testAPIEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const isArray = Array.isArray(json);
          const hasData = isArray ? json.length > 0 : json.success === true;
          resolve({
            status: res.statusCode === 200 ? "✅" : "⚠️",
            statusCode: res.statusCode,
            hasData: hasData,
            count: isArray ? json.length : (json.packages?.length || json.inquiries?.length || 0)
          });
        } catch (e) {
          resolve({ status: "❌", statusCode: res.statusCode, error: "Invalid JSON" });
        }
      });
    });

    req.on("error", (e) => {
      resolve({ status: "❌", error: "Connection refused" });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: "❌", error: "Timeout" });
    });

    req.end();
  });
}

async function runDiagnostics() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         TRAVEL EXPERTZ - SYSTEM DIAGNOSTIC REPORT         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📊 1. MONGODB CONNECTION TEST");
  console.log("─".repeat(60));
  const mongoResult = await testMongoDB();
  console.log(`Status: ${mongoResult.status}`);
  if (mongoResult.connection === "Connected") {
    console.log(`Packages: ${mongoResult.packages} documents`);
    console.log(`Inquiries: ${mongoResult.inquiries} documents`);
  } else {
    console.log(`Error: ${mongoResult.error}`);
  }

  console.log("\n🌐 2. API ENDPOINTS TEST");
  console.log("─".repeat(60));
  console.log("Testing API endpoints (requires dev server running on port 3000)\n");

  const endpoints = [
    { path: "/api/packages", name: "Packages" },
    { path: "/api/package-inquiries", name: "Inquiries" },
    { path: "/api/destinations", name: "Destinations" },
    { path: "/api/hotels", name: "Hotels" },
    { path: "/api/homestays", name: "Homestays" }
  ];

  let serverRunning = true;
  const results = {};

  for (const endpoint of endpoints) {
    const result = await testAPIEndpoint(endpoint.path);
    results[endpoint.name] = result;
    
    if (result.error && result.error.includes("refused")) {
      serverRunning = false;
    }
    
    const statusSymbol = result.status;
    const details = result.error 
      ? `ERROR: ${result.error}` 
      : `Status: ${result.statusCode}, Data: ${result.hasData ? "✓" : "✗"} (${result.count} items)`;
    
    console.log(`${statusSymbol} ${endpoint.name.padEnd(20)} - ${details}`);
  }

  console.log("\n📋 3. SUMMARY & RECOMMENDATIONS");
  console.log("─".repeat(60));

  let issuesFound = false;

  // Check MongoDB
  if (mongoResult.status === "❌") {
    console.log("❌ MongoDB Connection Failed");
    console.log("   → Verify MONGODB_URI in .env.local");
    console.log("   → Check internet connection");
    console.log("   → Ensure IP is whitelisted in MongoDB Atlas\n");
    issuesFound = true;
  } else if (mongoResult.packages === 0) {
    console.log("⚠️  No packages found in database");
    console.log("   → Seed the database with: npm run seed\n");
    issuesFound = true;
  }

  // Check API Server
  if (!serverRunning) {
    console.log("❌ Next.js Dev Server Not Running");
    console.log("   → Start with: npm run dev");
    console.log("   → Ensure port 3000 is available\n");
    issuesFound = true;
  }

  // Check if data is flowing
  const hasData = Object.values(results).some(r => r.hasData);
  if (serverRunning && !hasData && mongoResult.status === "✅" && mongoResult.packages > 0) {
    console.log("⚠️  Data exists in MongoDB but not loading via API");
    console.log("   → Check browser console for detailed errors");
    console.log("   → Verify MongoDB connection string");
    console.log("   → Check API route handlers\n");
    issuesFound = true;
  }

  if (!issuesFound) {
    console.log("✅ All systems operational!");
    console.log("   → MongoDB: Connected");
    console.log("   → Data: Available");
    console.log("   → API: Responding");
    console.log("   → No issues detected\n");
  }

  console.log("🔧 USEFUL COMMANDS");
  console.log("─".repeat(60));
  console.log("npm run dev              - Start development server");
  console.log("npm run seed             - Seed database with sample data");
  console.log("npm run build            - Build for production");
  console.log("node scripts/testMongoConnection.js  - Test MongoDB");
  console.log("node scripts/inspectData.js          - Inspect database");
  console.log("\n");
}

runDiagnostics().catch(console.error);
