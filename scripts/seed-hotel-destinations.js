const { MongoClient, ObjectId } = require('mongodb');
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

// Hotel destinations data with Indian states and major cities
const hotelDestinationsData = [
  // Rajasthan
  { stateName: 'Rajasthan', cityName: 'Jaipur' },
  { stateName: 'Rajasthan', cityName: 'Udaipur' },
  { stateName: 'Rajasthan', cityName: 'Jodhpur' },
  { stateName: 'Rajasthan', cityName: 'Pushkar' },
  { stateName: 'Rajasthan', cityName: 'Bikaner' },
  
  // Uttrakhand
  { stateName: 'Uttrakhand', cityName: 'Dehradun' },
  { stateName: 'Uttrakhand', cityName: 'Chamoli' },
  { stateName: 'Uttrakhand', cityName: 'Roorkee' },
  { stateName: 'Uttrakhand', cityName: 'Haridwar' },
  { stateName: 'Uttrakhand', cityName: 'Nainital' },
  { stateName: 'Uttrakhand', cityName: 'Rishikesh' },
  { stateName: 'Uttrakhand', cityName: 'Mussoorie' },
  
  // Uttar Pradesh
  { stateName: 'Uttar Pradesh', cityName: 'Lucknow' },
  { stateName: 'Uttar Pradesh', cityName: 'Agra' },
  { stateName: 'Uttar Pradesh', cityName: 'Varanasi' },
  { stateName: 'Uttar Pradesh', cityName: 'Noida' },
  { stateName: 'Uttar Pradesh', cityName: 'Kanpur' },
  
  // Maharashtra
  { stateName: 'Maharashtra', cityName: 'Mumbai' },
  { stateName: 'Maharashtra', cityName: 'Pune' },
  { stateName: 'Maharashtra', cityName: 'Aurangabad' },
  { stateName: 'Maharashtra', cityName: 'Nashik' },
  
  // Delhi
  { stateName: 'Delhi', cityName: 'New Delhi' },
  { stateName: 'Delhi', cityName: 'Old Delhi' },
  
  // Goa
  { stateName: 'Goa', cityName: 'Panaji' },
  { stateName: 'Goa', cityName: 'Margao' },
  
  // Tamil Nadu
  { stateName: 'Tamil Nadu', cityName: 'Chennai' },
  { stateName: 'Tamil Nadu', cityName: 'Ooty' },
  { stateName: 'Tamil Nadu', cityName: 'Kodaikanal' },
  
  // Kerala
  { stateName: 'Kerala', cityName: 'Kochi' },
  { stateName: 'Kerala', cityName: 'Thiruvananthapuram' },
  { stateName: 'Kerala', cityName: 'Alleppey' },
  
  // Himachal Pradesh
  { stateName: 'Himachal Pradesh', cityName: 'Shimla' },
  { stateName: 'Himachal Pradesh', cityName: 'Dharamshala' },
  { stateName: 'Himachal Pradesh', cityName: 'Manali' },
  
  // Jammu & Kashmir
  { stateName: 'Jammu & Kashmir', cityName: 'Srinagar' },
  { stateName: 'Jammu & Kashmir', cityName: 'Leh' },
];

async function seedHotelDestinations() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('hotel_destinations');
    
    // Clear existing data
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing records`);
    
    // Insert new data
    const result = await collection.insertMany(hotelDestinationsData);
    console.log(`✓ Inserted ${result.insertedCount} hotel destinations`);
    
    // Count unique states
    const uniqueStates = await collection.distinct('stateName');
    console.log(`✓ Total unique states: ${uniqueStates.length}`);
    console.log(`States: ${uniqueStates.join(', ')}`);
    
    // Show summary by state
    console.log('\nDestinations by state:');
    const stats = await collection.aggregate([
      {
        $group: {
          _id: '$stateName',
          cities: { $push: '$cityName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.cities.join(', ')}`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

seedHotelDestinations();
