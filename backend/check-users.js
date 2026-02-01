import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rateon';

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Count users with null phoneNumber
        const nullPhoneCount = await usersCollection.countDocuments({ phoneNumber: null });
        console.log(`\n📊 Users with phoneNumber: null - ${nullPhoneCount}`);

        // Count users with missing phoneNumber field
        const missingPhoneCount = await usersCollection.countDocuments({ phoneNumber: { $exists: false } });
        console.log(`📊 Users without phoneNumber field - ${missingPhoneCount}`);

        // Get sample users with null phoneNumber
        const sampleUsers = await usersCollection.find(
            { phoneNumber: null },
            { projection: { _id: 1, username: 1, email: 1, phoneNumber: 1 } }
        ).limit(5).toArray();
        
        console.log('\n📋 Sample users with null phoneNumber:');
        sampleUsers.forEach(user => {
            console.log(`  - ${user.username} (${user.email}) - phoneNumber: ${user.phoneNumber}`);
        });

        // Fix: Remove phoneNumber field from documents where it's null
        if (nullPhoneCount > 0) {
            console.log('\n🔧 Removing phoneNumber field from users where it is null...');
            const result = await usersCollection.updateMany(
                { phoneNumber: null },
                { $unset: { phoneNumber: "" } }
            );
            console.log(`✅ Updated ${result.modifiedCount} users`);
        }

        console.log('\n✅ Check and fix completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUsers();
