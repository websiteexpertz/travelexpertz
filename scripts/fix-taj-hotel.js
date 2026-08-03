const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get MONGODB_URI
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
const MONGO_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;
const DB_NAME = 'travelexpertz';

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function updateTajHotel() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const hotelsCollection = db.collection('hotels');

    // Find The Taj Hotel
    const tajHotel = await hotelsCollection.findOne({ 
      name: { $regex: "taj", $options: "i" } 
    });

    if (!tajHotel) {
      console.log('❌ The Taj Hotel not found');
      console.log('\nSearching for all hotels...');
      const allHotels = await hotelsCollection.find({}).toArray();
      console.log('Hotels in database:');
      allHotels.forEach(h => {
        console.log(`  - ${h.name} (ID: ${h._id}, Active: ${h.active}, City: ${h.city || 'MISSING'}, State: ${h.state || 'MISSING'})`);
      });
      return;
    }

    console.log('\n📍 Found The Taj Hotel:');
    console.log(`  ID: ${tajHotel._id}`);
    console.log(`  Name: ${tajHotel.name}`);
    console.log(`  Location: ${tajHotel.location}`);
    console.log(`  City: ${tajHotel.city || 'NOT SET'}`);
    console.log(`  State: ${tajHotel.state || 'NOT SET'}`);
    console.log(`  Active: ${tajHotel.active}`);
    console.log(`  Price: ${tajHotel.price}`);
    console.log(`  Image: ${tajHotel.image ? 'YES' : 'NO'}`);

    // Update with city/state if missing
    const updateData = {
      ...tajHotel,
      city: tajHotel.city || 'Mumbai',
      state: tajHotel.state || 'Maharashtra',
      active: true  // Ensure it's active
    };

    // Only update if city/state missing or not active
    if (!tajHotel.city || !tajHotel.state || tajHotel.active !== true) {
      const result = await hotelsCollection.updateOne(
        { _id: tajHotel._id },
        {
          $set: {
            city: updateData.city,
            state: updateData.state,
            active: true,
            updatedAt: new Date(),
          }
        }
      );

      console.log('\n✅ Updated The Taj Hotel:');
      console.log(`  City: ${updateData.city}`);
      console.log(`  State: ${updateData.state}`);
      console.log(`  Active: true`);
      console.log(`  Modified: ${result.modifiedCount} record(s)`);
    } else {
      console.log('\n✓ The Taj Hotel already has city/state set correctly');
    }

    // Verify update
    const updatedHotel = await hotelsCollection.findOne({ _id: tajHotel._id });
    console.log('\n✓ Verification - Hotel now has:');
    console.log(`  City: ${updatedHotel.city}`);
    console.log(`  State: ${updatedHotel.state}`);
    console.log(`  Active: ${updatedHotel.active}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

updateTajHotel();
