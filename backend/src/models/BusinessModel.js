import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    type: {
        type: String,
        enum: ['restaurant', 'cafe', 'shop', 'service', 'other'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxlength: 2000
    },
    logo: {
        type: String  // URL to business logo
    },
    coverImages: [{
        type: String  // URLs to uploaded images
    }],
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        },
        pincode: {
            type: String
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],  // [longitude, latitude]
                required: true
            }
        }
    },
    contact: {
        phone: {
            type: String
        },
        whatsapp: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        },
        website: {
            type: String
        }
    },
    businessHours: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        open: String,  // "09:00"
        close: String, // "22:00"
        isClosed: {
            type: Boolean,
            default: false
        }
    }],
    menuPDF: {
        type: String  // URL to uploaded PDF
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isClaimed: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    stats: {
        totalItems: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        avgRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
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
        ref: 'User'
    }
}, {
    timestamps: true
});

// Geospatial index for location-based queries
BusinessSchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
BusinessSchema.index({ name: 'text', description: 'text', category: 'text' });

// Common query indexes
BusinessSchema.index({ category: 1, 'stats.avgRating': -1 });
BusinessSchema.index({ 'location.city': 1 });
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ createdAt: -1 });

const Business = mongoose.model('Business', BusinessSchema);

export default Business;
