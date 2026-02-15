import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'new_review',           // Business owner gets this when someone reviews their item
            'review_reply',         // User gets this when someone replies to their review
            'reply_to_reply',       // User gets this when someone replies to their reply
            'review_reaction',      // User gets this when someone reacts to their review
            'reply_reaction',       // User gets this when someone reacts to their reply
            'business_response',    // User gets this when business owner responds to their review
            'mention',              // User gets this when mentioned in a reply
            'follow'                // User gets this when someone follows them
        ],
        required: true
    },
    entityType: {
        type: String,
        enum: ['review', 'reply', 'reaction', 'user', 'business'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  // Who triggered this notification
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    metadata: {
        reviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        },
        replyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reply'
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business'
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        reactionType: {
            type: String,
            enum: ['helpful', 'not_helpful']
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    link: {
        type: String  // Deep link to the relevant page (e.g., /reviews/:id)
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ triggeredBy: 1 });
NotificationSchema.index({ entityType: 1, entityId: 1 });

// Compound index for checking if notification already exists
NotificationSchema.index({ 
    userId: 1, 
    type: 1, 
    entityId: 1, 
    triggeredBy: 1 
});

// Auto-delete read notifications older than 30 days
NotificationSchema.index({ readAt: 1 }, { 
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isRead: true }
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
