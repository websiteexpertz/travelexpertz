const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

async function testFileAccess() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Get Kedarnath package
    const pkg = await db.collection('packages').findOne({ title: /Kedarnath/i });
    
    if (!pkg) {
      console.log('❌ Kedarnath package not found');
      return;
    }
    
    console.log('📦 Package:', pkg.title);
    console.log('🖼️  Cover Image:', pkg.image);
    console.log('🖼️  Gallery:', pkg.gallery?.length || 0, 'images');
    
    // Check if the image file exists in GridFS
    if (pkg.image) {
      const fileId = pkg.image.split('/').pop();
      console.log('\n🔍 Checking file ID:', fileId);
      
      const file = await db.collection('uploads.files').findOne({ _id: new ObjectId(fileId) });
      
      if (file) {
        console.log('✅ File found in GridFS');
        console.log('   Filename:', file.filename);
        console.log('   Length:', file.length, 'bytes');
        console.log('   Content Type:', file.metadata?.contentType || 'not set');
        console.log('   Upload Date:', file.uploadDate);
      } else {
        console.log('❌ File NOT found in GridFS!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testFileAccess();
