import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    activityType: {
        type: String,
        enum: ['review', 'reaction', 'follow', 'reply', 'business_claimed', 'item_added'],
        required: true,
        index: true
    },
    points: {
        type: Number,
        default: 0,
        comment: 'Points earned for trust score calculation'
    },
    relatedEntity: {
        type: {
            type: String,
            enum: ['Review', 'Reaction', 'Follow', 'Reply', 'Business', 'Item']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedEntity.type'
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        comment: 'Additional activity-specific data'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound indexes for efficient queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, activityType: 1, createdAt: -1 });

// Points configuration for different activities
export const ACTIVITY_POINTS = {
    review: 10,
    reaction: 1,
    follow: 2,
    reply: 3,
    business_claimed: 20,
    item_added: 5,
    helpful_reaction_received: 5, // Bonus when someone marks your review helpful
    review_with_photos: 15 // Extra points for reviews with photos
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
