import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
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
    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        default: null  // For nested replies
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
ReplySchema.index({ reviewId: 1, createdAt: 1 });
ReplySchema.index({ userId: 1 });
ReplySchema.index({ parentReplyId: 1 });

const Reply = mongoose.model('Reply', ReplySchema);

export default Reply;
