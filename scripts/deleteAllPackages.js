import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

async function deleteAllPackages() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    // Count packages before deletion
    const countBefore = await packagesCollection.countDocuments();
    console.log(`📦 Found ${countBefore} packages in database`);

    if (countBefore === 0) {
      console.log("⚠️  No packages to delete");
      return;
    }

    // Delete all packages
    const result = await packagesCollection.deleteMany({});

    console.log("\n✅ Deletion Complete!");
    console.log(`   🗑️  Deleted: ${result.deletedCount} packages`);
    
  } catch (error) {
    console.error("❌ Error deleting packages:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deleteAllPackages();
