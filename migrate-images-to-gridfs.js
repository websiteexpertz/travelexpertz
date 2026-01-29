const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

async function migrateImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ No uploads directory found');
      return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    console.log(`\n📁 Found ${files.length} files to migrate\n`);
    
    const urlMapping = {}; // Map old URL to new URL
    
    for (const filename of files) {
      try {
        const filePath = path.join(uploadsDir, filename);
        const fileStream = fs.createReadStream(filePath);
        
        // Detect content type
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.avif': 'image/avif',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        const uploadStream = bucket.openUploadStream(filename, {
          contentType,
          metadata: {
            originalName: filename,
            migratedAt: new Date(),
            originalPath: `/uploads/${filename}`
          }
        });
        
        await new Promise((resolve, reject) => {
          fileStream.pipe(uploadStream)
            .on('error', reject)
            .on('finish', resolve);
        });
        
        const oldUrl = `/uploads/${filename}`;
        const newUrl = `/api/files/${uploadStream.id}`;
        urlMapping[oldUrl] = newUrl;
        
        console.log(`✅ ${filename} → ${newUrl}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${filename}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration complete! ${Object.keys(urlMapping).length} files migrated`);
    
    // Save mapping to file for reference
    fs.writeFileSync(
      path.join(__dirname, 'url-mapping.json'),
      JSON.stringify(urlMapping, null, 2)
    );
    console.log('\n📄 URL mapping saved to url-mapping.json');
    
    // Now update database URLs
    console.log('\n🔄 Updating database URLs...');
    
    const packages = await db.collection('packages').find({}).toArray();
    let updatedCount = 0;
    
    for (const pkg of packages) {
      let updated = false;
      const updates = {};
      
      // Update cover image
      if (pkg.image && urlMapping[pkg.image]) {
        updates.image = urlMapping[pkg.image];
        updated = true;
      }
      
      // Update gallery
      if (pkg.gallery && Array.isArray(pkg.gallery)) {
        const newGallery = pkg.gallery.map(img => urlMapping[img] || img);
        if (JSON.stringify(newGallery) !== JSON.stringify(pkg.gallery)) {
          updates.gallery = newGallery;
          updated = true;
        }
      }
      
      if (updated) {
        await db.collection('packages').updateOne(
          { _id: pkg._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`✅ Updated package: ${pkg.title}`);
      }
    }
    
    console.log(`\n✨ Updated ${updatedCount} packages with new URLs`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.close();
  }
}

console.log('🚀 Starting image migration to MongoDB GridFS...\n');
migrateImages();
