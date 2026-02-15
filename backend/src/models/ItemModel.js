import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        maxlength: 1000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String  // URLs to uploaded images
    }],
    category: {
        type: String,
        required: true,
        trim: true  // e.g., "Snacks", "Beverages", "Main Course"
    },
    availability: {
        status: {
            type: String,
            enum: ['available', 'out_of_stock', 'coming_soon'],
            default: 'available'
        },
        availableUntil: {
            type: Date  // Optional: item available until this date
        },
        note: {
            type: String,  // e.g., "Not available today", "Back in stock on 15 Jan"
            maxlength: 200
        }
    },
    stats: {
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        ratingDistribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        },
        views: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
ItemSchema.index({ businessId: 1, isActive: 1 });
ItemSchema.index({ name: 'text', description: 'text', category: 'text' });
ItemSchema.index({ 'stats.averageRating': -1 });
ItemSchema.index({ price: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ 'availability.status': 1 });
ItemSchema.index({ createdAt: -1 });

// Method to update rating after new review or review deletion
ItemSchema.methods.updateRating = async function(rating, operation = 'add') {
    // Validate rating
    if (rating < 1 || rating > 5) {
        return;
    }
    
    // Update counts based on operation
    if (operation === 'add') {
        this.stats.totalReviews += 1;
        this.stats.ratingDistribution[rating] = (this.stats.ratingDistribution[rating] || 0) + 1;
    } else if (operation === 'remove') {
        this.stats.totalReviews = Math.max(0, this.stats.totalReviews - 1);
        this.stats.ratingDistribution[rating] = Math.max(0, (this.stats.ratingDistribution[rating] || 0) - 1);
    }
    
    // Recalculate average from distribution
    if (this.stats.totalReviews > 0) {
        const totalPoints = 
            (this.stats.ratingDistribution[1] * 1) +
            (this.stats.ratingDistribution[2] * 2) +
            (this.stats.ratingDistribution[3] * 3) +
            (this.stats.ratingDistribution[4] * 4) +
            (this.stats.ratingDistribution[5] * 5);
        
        this.stats.averageRating = totalPoints / this.stats.totalReviews;
        
        // Ensure average is within valid range
        this.stats.averageRating = Math.min(5, Math.max(0, this.stats.averageRating));
    } else {
        this.stats.averageRating = 0;
    }
    
    await this.save();
};

// Virtual properties for backward compatibility
ItemSchema.virtual('reviewCount').get(function() {
    return this.stats.totalReviews;
});

ItemSchema.virtual('averageRating').get(function() {
    return this.stats.averageRating;
});

// Ensure virtuals are included in JSON
ItemSchema.set('toJSON', { virtuals: true });
ItemSchema.set('toObject', { virtuals: true });

const Item = mongoose.model('Item', ItemSchema);

export default Item;
