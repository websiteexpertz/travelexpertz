const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

async function checkPackageImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    const packages = await db.collection('packages').find({}).toArray();
    
    console.log('\n📦 Package Images Status:\n');
    
    packages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.title || 'Untitled'}`);
      console.log(`   Cover Image: ${pkg.image || 'NONE'}`);
      console.log(`   Gallery: ${pkg.gallery ? pkg.gallery.length + ' images' : 'NONE'}`);
      if (pkg.gallery && pkg.gallery.length > 0) {
        pkg.gallery.forEach((img, i) => {
          console.log(`     ${i + 1}. ${img}`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkPackageImages();
