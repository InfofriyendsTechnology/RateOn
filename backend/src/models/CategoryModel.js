import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    icon: {
        type: String  // URL to category icon/image
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0  // 0 = main category, 1 = subcategory
    },
    order: {
        type: Number,
        default: 0  // For sorting categories
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stats: {
        totalBusinesses: {
            type: Number,
            default: 0
        },
        totalItems: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ level: 1, order: 1 });
CategorySchema.index({ name: 'text', description: 'text' });

// Pre-save hook to generate slug from name
CategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;
