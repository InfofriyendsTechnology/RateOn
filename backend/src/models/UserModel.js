import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLES, ROLE_VALUES } from '../constants/roles.js';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ROLE_VALUES,
        default: ROLES.USER,
    },
    profile: {
        firstName: {
            type: String,
            trim: true,
            default: ''
        },
        lastName: {
            type: String,
            trim: true,
            default: ''
        },
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        dateOfBirth: {
            type: Date,
            default: null
        }
    },
    trustScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    stats: {
        totalReviews: {
            type: Number,
            default: 0
        },
        totalReactions: {
            type: Number,
            default: 0
        },
        totalFollowers: {
            type: Number,
            default: 0
        },
        totalFollowing: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

UserSchema.index({ trustScore: -1 });
UserSchema.index({ level: -1 });

UserSchema.pre('save', async function() {
    // Remove phoneNumber field entirely if null or empty string for sparse index
    if (this.phoneNumber === '' || this.phoneNumber === null) {
        this.phoneNumber = undefined;
    }
    
    if (!this.isModified('password') || !this.password) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.calculateTrustScore = function() {
    // Very simple v1 logic: everyone starts at 50,
    // and trust only grows from real activity on the platform.
    let score = 50;

    // Reviews contribute up to +30 points
    if (this.stats.totalReviews > 0) {
        score += Math.min(this.stats.totalReviews * 3, 30);
    }

    // Reactions (community feedback) contribute up to +20 points
    if (this.stats.totalReactions > 0) {
        score += Math.min(this.stats.totalReactions, 20);
    }

    // Clamp between 0 and 100
    return Math.max(0, Math.min(score, 100));
};

UserSchema.methods.getVerificationBadges = function() {
    const badges = [];
    if (this.googleId) badges.push('google_verified');
    if (this.isEmailVerified) badges.push('email_verified');
    if (this.isPhoneVerified) badges.push('phone_verified');
    if (this.trustScore >= 80) badges.push('trusted_reviewer');
    if (this.level >= 5) badges.push('top_contributor');
    return badges;
};

const User = mongoose.model('User', UserSchema);

export default User;
