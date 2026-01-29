const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";

async function fixImportantNotes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db("travelexpertz");
    const packagesCollection = db.collection("packages");

    // Find packages with long important notes (likely unformatted)
    const packages = await packagesCollection.find({
      "importantNotes.0": { $exists: true }
    }).toArray();

    console.log(`Found ${packages.length} packages with important notes\n`);

    for (const pkg of packages) {
      // Check if any note is longer than 500 chars (likely needs splitting)
      const longNotes = pkg.importantNotes.filter(note => note.length > 500);
      
      if (longNotes.length > 0) {
        console.log(`\n🔧 Fixing: ${pkg.title}`);
        console.log(`   Found ${longNotes.length} long notes that need splitting`);
        
        // Split the long notes
        const newNotes = [];
        pkg.importantNotes.forEach(note => {
          if (note.length > 500) {
            // Split by bullet points and clean
            const split = note
              .split(/•/)
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => {
                // Remove leading numbers and periods
                return line.replace(/^\d+\.\s*/, '').trim();
              })
              .filter(line => line.length > 0);
            
            newNotes.push(...split);
          } else {
            newNotes.push(note);
          }
        });

        console.log(`   Split into ${newNotes.length} individual notes`);
        
        // Update the package
        await packagesCollection.updateOne(
          { _id: pkg._id },
          { $set: { importantNotes: newNotes } }
        );
        
        console.log(`   ✅ Updated successfully`);
      }
    }

    console.log("\n✨ Done fixing important notes!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

fixImportantNotes();
