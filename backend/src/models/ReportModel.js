import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reportedItemType: {
        type: String,
        enum: ['review', 'reply', 'user', 'business', 'item'],
        required: true,
        index: true
    },
    reportedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'reportedItemType'
    },
    reason: {
        type: String,
        enum: [
            'spam',
            'harassment',
            'inappropriate_content',
            'false_information',
            'offensive_language',
            'copyright_violation',
            'other'
        ],
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved', 'rejected'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    resolution: {
        action: {
            type: String,
            enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned']
        },
        note: String,
        resolvedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound indexes for efficient queries
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedItemType: 1, reportedItemId: 1 });

// Update updatedAt on save
reportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Prevent duplicate reports for same item by same user
reportSchema.index({ reporterId: 1, reportedItemId: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;
