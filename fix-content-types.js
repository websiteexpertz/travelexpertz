const { MongoClient } = require('mongodb');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';

async function fixContentTypes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    const files = await db.collection('uploads.files').find({}).toArray();
    
    console.log(`Found ${files.length} files in GridFS\n`);
    
    let updated = 0;
    
    for (const file of files) {
      // Skip if already has contentType in metadata
      if (file.metadata?.contentType) {
        continue;
      }
      
      // Detect content type from filename
      const ext = path.extname(file.filename).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';
      
      // Update the file metadata
      await db.collection('uploads.files').updateOne(
        { _id: file._id },
        { 
          $set: { 
            'metadata.contentType': contentType 
          } 
        }
      );
      
      updated++;
      console.log(`✅ Updated: ${file.filename} → ${contentType}`);
    }
    
    console.log(`\n✨ Updated ${updated} files with content types`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

console.log('🔧 Fixing content types for existing GridFS files...\n');
fixContentTypes();
