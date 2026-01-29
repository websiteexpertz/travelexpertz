const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://websiteexpertz:expertz%402021@cluster0.hzqb0uj.mongodb.net/travelexpertz?retryWrites=true&w=majority';
const MONGODB_DB = 'travelexpertz';
const LOG_FILE = 'package-audit.log';

async function auditPackages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    const packages = await db.collection('packages').find({}).toArray();
    const gridfsFiles = await db.collection('uploads.files').countDocuments();
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      totalPackages: packages.length,
      packagesWithImages: packages.filter(p => p.image).length,
      totalGridFSFiles: gridfsFiles,
      packages: packages.map(p => ({
        id: p._id.toString(),
        title: p.title,
        hasImage: !!p.image,
        imageUrl: p.image || 'NONE',
        galleryCount: p.gallery ? p.gallery.length : 0
      }))
    };
    
    console.log('\n📊 Package Audit Report');
    console.log('=' .repeat(50));
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Total Packages: ${report.totalPackages}`);
    console.log(`Packages with Images: ${report.packagesWithImages}`);
    console.log(`GridFS Files: ${report.totalGridFSFiles}`);
    console.log('=' .repeat(50));
    
    report.packages.forEach((pkg, i) => {
      console.log(`\n${i + 1}. ${pkg.title}`);
      console.log(`   Image: ${pkg.imageUrl}`);
      console.log(`   Gallery: ${pkg.galleryCount} images`);
    });
    
    // Save to log file
    const logEntry = `\n\n${'='.repeat(70)}\n${JSON.stringify(report, null, 2)}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    
    console.log(`\n✅ Audit saved to ${LOG_FILE}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

console.log('🔍 Running Package Audit...\n');
auditPackages();
