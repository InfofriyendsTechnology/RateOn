import mongoose from 'mongoose';

async function verify() {
  await mongoose.connect('mongodb://localhost:27017/rateon');
  const collections = await mongoose.connection.db.listCollections().toArray();
  
  console.log('Database Status:\n');
  
  let totalDocs = 0;
  for (const coll of collections) {
    const count = await mongoose.connection.db.collection(coll.name).countDocuments();
    console.log(`  ${coll.name}: ${count} documents`);
    totalDocs += count;
  }
  
  console.log(`\nTotal: ${totalDocs} documents in ${collections.length} collections`);
  
  if (totalDocs === 0) {
    console.log('\n✅ Database is completely empty - ready for fresh start!');
  }
  
  await mongoose.connection.close();
}

verify();
