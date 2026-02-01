import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rateon';

async function fixPhoneNumberIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Get existing indexes
        const indexes = await usersCollection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}:`, idx.key, idx.sparse ? '(sparse)' : '');
        });

        // Drop the phoneNumber index if it exists and is not sparse
        const phoneIndex = indexes.find(idx => idx.key.phoneNumber === 1);
        if (phoneIndex) {
            if (!phoneIndex.sparse) {
                console.log('\n🔧 Dropping non-sparse phoneNumber index...');
                await usersCollection.dropIndex('phoneNumber_1');
                console.log('✅ Dropped phoneNumber_1 index');
            } else {
                console.log('\n✓ phoneNumber index is already sparse');
            }
        }

        // Create sparse unique index for phoneNumber
        console.log('\n🔧 Creating sparse unique index for phoneNumber...');
        await usersCollection.createIndex(
            { phoneNumber: 1 },
            { unique: true, sparse: true, name: 'phoneNumber_1' }
        );
        console.log('✅ Created sparse unique index for phoneNumber');

        // Verify the new index
        const newIndexes = await usersCollection.indexes();
        const newPhoneIndex = newIndexes.find(idx => idx.key.phoneNumber === 1);
        console.log('\n📋 New phoneNumber index:', newPhoneIndex);

        console.log('\n✅ Index fix completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
}

fixPhoneNumberIndex();
