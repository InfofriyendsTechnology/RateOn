import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rateon';

async function fixReviewIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const reviewsCollection = db.collection('reviews');

        // Get existing indexes
        const indexes = await reviewsCollection.indexes();
        indexes.forEach(index => {
        });

        // Drop the problematic index if it exists
        try {
            await reviewsCollection.dropIndex('userId_1_itemId_1');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
            } else {
                throw error;
            }
        }

        // Create new indexes with partial filter expressions
        // Index for item reviews only (when itemId exists)
        await reviewsCollection.createIndex(
            { userId: 1, itemId: 1 },
            { 
                unique: true,
                name: 'userId_1_itemId_1_item_reviews',
                partialFilterExpression: { 
                    reviewType: 'item', 
                    itemId: { $exists: true, $type: 'objectId' } 
                }
            }
        );
        // Index for business reviews only
        await reviewsCollection.createIndex(
            { userId: 1, businessId: 1, reviewType: 1 },
            { 
                unique: true,
                name: 'userId_1_businessId_1_reviewType_1_business_reviews',
                partialFilterExpression: { reviewType: 'business' }
            }
        );
        // Display final indexes
        const finalIndexes = await reviewsCollection.indexes();
        finalIndexes.forEach(index => {
            if (index.partialFilterExpression) {
            }
        });
    } catch (error) {
        throw error;
    } finally {
        await mongoose.disconnect();
    }
}

// Run the migration
fixReviewIndexes()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });
