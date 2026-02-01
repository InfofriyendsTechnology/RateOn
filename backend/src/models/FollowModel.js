import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate follows and optimize queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Index for getting followers of a user
followSchema.index({ followingId: 1, createdAt: -1 });

// Index for getting users a user is following
followSchema.index({ followerId: 1, createdAt: -1 });

// Prevent self-following
followSchema.pre('save', function(next) {
    if (this.followerId.equals(this.followingId)) {
        next(new Error('Users cannot follow themselves'));
    } else {
        next();
    }
});

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
