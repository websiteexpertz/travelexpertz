const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function check() {
  try {
    await client.connect();
    const db = client.db('travelexpertz');
    const bookings = await db.collection('bookings')
      .find({ userId: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('\n=== Last 5 Bookings ===\n');
    bookings.forEach(b => {
      console.log('ID:', b._id.toString());
      console.log('propertyType:', b.propertyType || 'NOT SET');
      console.log('propertyName:', b.propertyName);
      console.log('bookingStatus:', b.bookingStatus);
      console.log('userId:', b.userId?.toString());
      console.log('---\n');
    });
  } finally {
    await client.close();
  }
}
check();
