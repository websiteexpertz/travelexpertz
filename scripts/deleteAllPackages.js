import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

async function deleteAllPackages() {
  console.log("\n⚠️  WARNING: This will DELETE ALL PACKAGES from the database!");
  console.log("⚠️  This includes packages with images stored in MongoDB GridFS.");
  console.log("⚠️  The images will remain in GridFS but will be orphaned.\n");
  console.log("🛑 THIS ACTION CANNOT BE UNDONE!\n");
  console.log("If you're sure you want to proceed, uncomment the deletion code.\n");
  
  return; // Comment this line to actually run the deletion
  
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
