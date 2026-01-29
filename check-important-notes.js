const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";

async function checkImportantNotes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("travelexpertz");
    const packages = await db
      .collection("packages")
      .find({})
      .project({ title: 1, importantNotes: 1 })
      .toArray();

    console.log("\n📦 Important Notes in Packages:\n");

    packages.forEach((pkg) => {
      console.log(`\n🔹 ${pkg.title}`);
      if (pkg.importantNotes && pkg.importantNotes.length > 0) {
        console.log(`   Count: ${pkg.importantNotes.length} items`);
        pkg.importantNotes.forEach((note, idx) => {
          const preview = note.length > 100 ? note.substring(0, 100) + "..." : note;
          console.log(`   [${idx}] Length: ${note.length} chars`);
          console.log(`       "${preview}"`);
        });
      } else {
        console.log("   ❌ No important notes");
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkImportantNotes();
