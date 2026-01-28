import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz";
const MONGODB_DB = "travelexpertz";

async function deleteBuiltInFields() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(MONGODB_DB);
    const formFieldsCollection = db.collection("formFields");

    const result = await formFieldsCollection.deleteMany({ isBuiltIn: true });

    console.log(`✅ Deleted ${result.deletedCount} built-in fields`);
  } catch (error) {
    console.error("Error deleting built-in fields:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deleteBuiltInFields();
