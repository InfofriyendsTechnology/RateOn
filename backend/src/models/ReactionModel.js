import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['helpful', 'not_helpful'],
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reactions
ReactionSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

// Indexes for queries
ReactionSchema.index({ reviewId: 1, type: 1 });
ReactionSchema.index({ userId: 1 });

const Reaction = mongoose.model('Reaction', ReactionSchema);

export default Reaction;
