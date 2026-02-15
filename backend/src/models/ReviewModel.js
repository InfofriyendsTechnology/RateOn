import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: false  // Optional - null for business reviews
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    reviewType: {
        type: String,
        enum: ['business', 'item'],
        required: true,
        default: 'item'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        maxlength: 2000
    },
    images: [{
        type: String  // URLs to uploaded images
    }],
    isPermanent: {
        type: Boolean,
        default: true  // Reviews cannot be deleted by business owners
    },
    ownerResponse: {
        comment: {
            type: String,
            maxlength: 1000
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: {
            type: Date
        }
    },
    stats: {
        helpfulCount: {
            type: Number,
            default: 0
        },
        notHelpfulCount: {
            type: Number,
            default: 0
        },
        replyCount: {
            type: Number,
            default: 0
        }
    },
    trustScoreGained: {
        type: Number,
        default: 0  // Trust score points earned from this review
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
ReviewSchema.index({ itemId: 1, createdAt: -1 });
ReviewSchema.index({ businessId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ 'stats.helpfulCount': -1 });
ReviewSchema.index({ createdAt: -1 });

// Compound index for finding user's review on specific item (item reviews only)
// Only enforce uniqueness for ACTIVE reviews - allows users to review again after deletion
ReviewSchema.index({ userId: 1, itemId: 1 }, { 
    unique: true, 
    partialFilterExpression: { 
        reviewType: 'item', 
        itemId: { $exists: true, $type: 'objectId' },
        isActive: true
    } 
});

// Compound index for finding user's review on specific business (business reviews)
// Only enforce uniqueness for ACTIVE reviews
ReviewSchema.index({ userId: 1, businessId: 1, reviewType: 1 }, { 
    unique: true, 
    partialFilterExpression: { 
        reviewType: 'business',
        isActive: true
    } 
});

// Text search
ReviewSchema.index({ title: 'text', comment: 'text' });

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
