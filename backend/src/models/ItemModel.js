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

// Method to update rating after new review
ItemSchema.methods.updateRating = async function(newRating) {
    this.stats.totalReviews += 1;
    this.stats.ratingDistribution[newRating] += 1;
    
    // Calculate new average
    const totalPoints = 
        (this.stats.ratingDistribution[1] * 1) +
        (this.stats.ratingDistribution[2] * 2) +
        (this.stats.ratingDistribution[3] * 3) +
        (this.stats.ratingDistribution[4] * 4) +
        (this.stats.ratingDistribution[5] * 5);
    
    this.stats.averageRating = totalPoints / this.stats.totalReviews;
    
    await this.save();
};

const Item = mongoose.model('Item', ItemSchema);

export default Item;
