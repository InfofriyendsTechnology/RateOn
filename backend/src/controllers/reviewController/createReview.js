import Joi from 'joi';
import { Review, Item, Business, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity } from '../../utils/activityTracker.js';

export default {
    validator: validator({
        body: Joi.object({
            itemId: Joi.string().required(),
            businessId: Joi.string().required(),
            rating: Joi.number().min(1).max(5).required(),
            title: Joi.string().trim().max(100).optional(),
            comment: Joi.string().trim().max(2000).required(),
            images: Joi.array().items(Joi.string().uri()).optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, businessId, rating, title, comment } = req.body;
        
        // Get uploaded image URLs from middleware
        const images = req.uploadedFiles ? req.uploadedFiles.map(f => f.url) : [];

        // Validate required fields
        if (!itemId || !businessId || !rating || !comment) {
            return responseHandler.badRequest(res, 'Missing required fields: itemId, businessId, rating, comment');
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return responseHandler.badRequest(res, 'Rating must be between 1 and 5');
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return responseHandler.notFound(res, 'Item not found');
        }

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

        // Check if item belongs to this business
        if (item.businessId.toString() !== businessId) {
            return responseHandler.badRequest(res, 'Item does not belong to this business');
        }

        // Check if user already reviewed this item
        const existingReview = await Review.findOne({ userId, itemId });
        if (existingReview) {
            return responseHandler.conflict(res, 'You have already reviewed this item. Please edit your existing review.');
        }

        // Create review
        const review = new Review({
            itemId,
            businessId,
            userId,
            rating,
            title: title || '',
            comment,
            images: images || []
        });

        await review.save();

        // Update item rating
        await item.updateRating(rating, 'add');

        // Update business rating by recalculating from all its items
        const businessItems = await Item.find({ businessId });
        let totalRating = 0;
        let totalReviews = 0;
        
        businessItems.forEach(item => {
            if (item.reviewCount > 0) {
                totalRating += item.averageRating * item.reviewCount;
                totalReviews += item.reviewCount;
            }
        });

        if (totalReviews > 0) {
            business.rating.average = totalRating / totalReviews;
            business.rating.count = totalReviews;
            
            // Update rating distribution
            const allReviews = await Review.find({ businessId });
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            allReviews.forEach(r => {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            });
            business.rating.distribution = distribution;
            
            await business.save();
        }

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.totalReviews': 1 }
        });

        // Log activity for trust score
        await logActivity(
            userId,
            'review',
            { type: 'Review', id: review._id },
            { hasPhotos: images && images.length > 0, itemId, businessId }
        );

        // Populate review data for response
        await review.populate([
            { path: 'userId', select: 'username profile.firstName profile.lastName profile.avatar trustScore level' },
            { path: 'itemId', select: 'name images' },
            { path: 'businessId', select: 'name' }
        ]);

        return responseHandler.success(
            res,
            'Review created successfully',
            review,
            201
        );

    } catch (error) {
        console.error('Create review error:', error);
        return responseHandler.error(res, error?.message || 'Failed to create review');
    }
    }
};


