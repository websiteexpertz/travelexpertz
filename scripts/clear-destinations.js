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

async function clearDestinations() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Collections to clear
    const collections = [
      'destinations',
      'locations',
      'hotel_destinations',
      'hotel_destination_states'
    ];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`✓ Cleared '${collectionName}': Deleted ${result.deletedCount} documents`);
    }
    
    console.log('\n✓ All destination collections cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✓ Disconnected from MongoDB');
  }
}

clearDestinations();
