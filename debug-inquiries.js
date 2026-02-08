const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority";
const dbName = "travelexpertz";

console.log("MongoDB URI:", uri ? "✅ Set" : "❌ Not set");

async function checkInquiries() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const inquiriesCollection = db.collection("package_inquiries");

    console.log("\n📊 ALL PACKAGE INQUIRIES IN DATABASE:\n");
    const allInquiries = await inquiriesCollection.find({}).toArray();
    console.log(`Total inquiries: ${allInquiries.length}\n`);

    allInquiries.forEach((inquiry, index) => {
      console.log(`${index + 1}. Inquiry ID: ${inquiry._id}`);
      console.log(`   Package: ${inquiry.packageTitle}`);
      console.log(`   Customer Email: ${inquiry.customer?.email}`);
      console.log(`   Customer Name: ${inquiry.customer?.fullName}`);
      console.log(`   Status: ${inquiry.status}`);
      console.log(`   Created: ${inquiry.createdAt}\n`);
    });

    // Check specifically for this email
    console.log("\n🔍 SEARCHING FOR: nirbhayrajput003@gmail.com\n");
    const userInquiries = await inquiriesCollection
      .find({ "customer.email": "nirbhayrajput003@gmail.com" })
      .toArray();

    console.log(`Found ${userInquiries.length} inquiries for this email`);
    console.log(JSON.stringify(userInquiries, null, 2));

    // Also try lowercase
    console.log("\n🔍 SEARCHING FOR (lowercase): nirbhayrajput003@gmail.com\n");
    const userInquiriesLower = await inquiriesCollection
      .find({ "customer.email": { $regex: "nirbhayrajput003@gmail.com", $options: "i" } })
      .toArray();

    console.log(`Found ${userInquiriesLower.length} inquiries with case-insensitive search`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkInquiries();
