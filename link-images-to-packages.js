const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

// Load the URL mapping from migration
const urlMapping = JSON.parse(fs.readFileSync('./url-mapping.json', 'utf8'));

async function linkMigratedImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    console.log('🔗 Linking migrated images to packages...\n');
    
    // Get all GridFS files
    const gridfsFiles = await db.collection('uploads.files').find({}).toArray();
    console.log(`Found ${gridfsFiles.length} files in GridFS\n`);
    
    // Create a reverse mapping: filename -> new URL
    const filenameToUrl = {};
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const filename = oldUrl.split('/uploads/')[1];
      filenameToUrl[filename] = newUrl;
    }
    
    // Ask user which package gets which images
    // For now, let's just assign some sample images to first package as example
    
    const packages = await db.collection('packages').find({}).toArray();
    
    if (packages.length === 0) {
      console.log('No packages found!');
      return;
    }
    
    // Get available image URLs
    const availableImages = Object.values(urlMapping);
    
    console.log('📋 Available images:');
    availableImages.slice(0, 10).forEach((url, i) => {
      const filename = url.split('/')[3]; // Get the ID
      const originalFile = Object.keys(urlMapping).find(key => urlMapping[key] === url);
      console.log(`${i + 1}. ${originalFile} → ${url}`);
    });
    console.log(`... and ${availableImages.length - 10} more\n`);
    
    console.log('\n💡 To assign images to packages:');
    console.log('1. Go to Admin Panel → Packages');
    console.log('2. Edit each package');
    console.log('3. Upload images - they will use GridFS automatically');
    console.log('\nOR manually update database with specific image URLs using this format:');
    console.log(`
await db.collection('packages').updateOne(
  { title: "Package Name" },
  { 
    $set: { 
      image: "/api/files/697b5a697d0a09a2a7b98420",
      gallery: [
        "/api/files/697b5a6a7d0a09a2a7b98426",
        "/api/files/697b5a717d0a09a2a7b9844a"
      ]
    }
  }
);
    `);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

linkMigratedImages();
