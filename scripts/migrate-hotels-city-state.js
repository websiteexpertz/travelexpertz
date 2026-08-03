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

console.log('✓ Using MongoDB URI from .env.local');

// Map of locations to city/state
const LOCATION_MAPPING = {
  'Mumbai': { city: 'Mumbai', state: 'Maharashtra' },
  'Pune': { city: 'Pune', state: 'Maharashtra' },
  'Delhi': { city: 'New Delhi', state: 'Delhi' },
  'New Delhi': { city: 'New Delhi', state: 'Delhi' },
  'Jaipur': { city: 'Jaipur', state: 'Rajasthan' },
  'Agra': { city: 'Agra', state: 'Uttar Pradesh' },
  'Varanasi': { city: 'Varanasi', state: 'Uttar Pradesh' },
  'Lucknow': { city: 'Lucknow', state: 'Uttar Pradesh' },
  'Bangalore': { city: 'Bangalore', state: 'Karnataka' },
  'Hyderabad': { city: 'Hyderabad', state: 'Telangana' },
  'Chennai': { city: 'Chennai', state: 'Tamil Nadu' },
  'Kolkata': { city: 'Kolkata', state: 'West Bengal' },
  'Goa': { city: 'Panaji', state: 'Goa' },
  'Kochi': { city: 'Kochi', state: 'Kerala' },
  'Shimla': { city: 'Shimla', state: 'Himachal Pradesh' },
  'Manali': { city: 'Manali', state: 'Himachal Pradesh' },
  'Darjeeling': { city: 'Darjeeling', state: 'West Bengal' },
  'Ooty': { city: 'Ooty', state: 'Tamil Nadu' },
  'Udaipur': { city: 'Udaipur', state: 'Rajasthan' },
  'Jodhpur': { city: 'Jodhpur', state: 'Rajasthan' },
};

async function migrateHotels() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const hotelsCollection = db.collection('hotels');

    // Get all hotels
    const hotels = await hotelsCollection.find({}).toArray();
    console.log(`\nFound ${hotels.length} hotels to process`);

    let updated = 0;
    let alreadyHasFields = 0;

    for (const hotel of hotels) {
      // Skip if already has city and state
      if (hotel.city && hotel.state) {
        alreadyHasFields++;
        continue;
      }

      let city = hotel.city;
      let state = hotel.state;

      // Try to extract from location field
      if (!city || !state) {
        const locationStr = hotel.location || '';
        
        // Try exact matches first
        for (const [key, value] of Object.entries(LOCATION_MAPPING)) {
          if (locationStr.toLowerCase().includes(key.toLowerCase())) {
            city = value.city;
            state = value.state;
            break;
          }
        }

        // If still not found, try partial extraction (e.g., "Mumbai, Maharashtra")
        if (!city || !state) {
          const parts = locationStr.split(',').map(p => p.trim());
          if (parts.length >= 1) {
            const potentialCity = parts[0];
            // Check if it matches any known city
            for (const [key, value] of Object.entries(LOCATION_MAPPING)) {
              if (potentialCity.toLowerCase() === key.toLowerCase()) {
                city = value.city;
                state = value.state;
                break;
              }
            }
          }
        }
      }

      // Only update if we found city and state
      if (city && state) {
        await hotelsCollection.updateOne(
          { _id: hotel._id },
          {
            $set: {
              city: city,
              state: state,
              updatedAt: new Date(),
            },
          }
        );
        updated++;
        console.log(`  ✓ Updated: ${hotel.name} → ${city}, ${state}`);
      } else {
        console.log(`  ⚠ Skipped: ${hotel.name} (location: "${hotel.location}" - could not determine city/state)`);
      }
    }

    console.log(`\n✓ Migration complete:`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Already had city/state: ${alreadyHasFields}`);
    console.log(`  - Total: ${hotels.length}`);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

migrateHotels();
