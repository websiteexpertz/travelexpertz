const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

async function checkImageUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    console.log('\n📦 Checking Packages...');
    const packages = await db.collection('packages').find({}).toArray();
    
    let oldUrlCount = 0;
    let newUrlCount = 0;
    
    packages.forEach(pkg => {
      if (pkg.image && pkg.image.startsWith('/uploads/')) {
        console.log(`❌ OLD URL: ${pkg.title} - ${pkg.image}`);
        oldUrlCount++;
      } else if (pkg.image && pkg.image.startsWith('/api/files/')) {
        console.log(`✅ NEW URL: ${pkg.title} - ${pkg.image}`);
        newUrlCount++;
      }
      
      if (pkg.gallery && Array.isArray(pkg.gallery)) {
        pkg.gallery.forEach(img => {
          if (img.startsWith('/uploads/')) oldUrlCount++;
          else if (img.startsWith('/api/files/')) newUrlCount++;
        });
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Old URLs (/uploads/): ${oldUrlCount}`);
    console.log(`New URLs (/api/files/): ${newUrlCount}`);
    
    console.log('\n🗂️ GridFS Files:');
    const files = await db.collection('uploads.files').find({}).toArray();
    console.log(`Total files in GridFS: ${files.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkImageUrls();
