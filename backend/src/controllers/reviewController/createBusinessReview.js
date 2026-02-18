import Joi from 'joi';
import { Review, Business, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity } from '../../utils/activityTracker.js';
import NotificationService from '../../utils/notificationService.js';

export default {
    validator: validator({
        body: Joi.object({
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
        const { businessId, rating, title, comment } = req.body;
        
        // Get uploaded image URLs from middleware
        const images = req.uploadedFiles ? req.uploadedFiles.map(f => f.url) : [];

        // Validate required fields
        if (!businessId || !rating || !comment) {
            return responseHandler.badRequest(res, 'Missing required fields: businessId, rating, comment');
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return responseHandler.badRequest(res, 'Rating must be between 1 and 5');
        }

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

        // Check if user already reviewed this business (only active reviews)
        const existingReview = await Review.findOne({ userId, businessId, reviewType: 'business', isActive: true });
        if (existingReview) {
            return responseHandler.conflict(res, 'You have already reviewed this business. Please edit your existing review.');
        }

        // Create business review (no itemId)
        const review = new Review({
            businessId,
            userId,
            rating,
            reviewType: 'business',
            title: title || '',
            comment,
            images: images || []
        });

        await review.save();

        // Update business rating - calculate from all business reviews
        const businessReviews = await Review.find({ businessId, reviewType: 'business', isActive: true });
        
        if (businessReviews.length > 0) {
            const totalRating = businessReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / businessReviews.length;
            
            // Update rating distribution
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            businessReviews.forEach(r => {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            });
            
            business.rating = business.rating || {};
            business.rating.average = avgRating;
            business.rating.count = businessReviews.length;
            business.rating.distribution = distribution;
            
            // Update stats for backward compatibility
            business.stats = business.stats || {};
            business.stats.totalReviews = businessReviews.length;
            business.stats.avgRating = avgRating;
            
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
            { hasPhotos: images && images.length > 0, businessId, reviewType: 'business' }
        );

        // Create notification for business owner
        const businessOwnerId = business.owner;
        if (businessOwnerId && businessOwnerId.toString() !== userId.toString()) {
            await NotificationService.notifyNewReview(
                {
                    _id: review._id,
                    userId,
                    businessId,
                    rating
                },
                businessOwnerId
            );
        }

        // Populate review data for response
        await review.populate([
            { path: 'userId', select: 'username profile.firstName profile.lastName profile.avatar trustScore level' },
            { path: 'businessId', select: 'name logo' }
        ]);

        return responseHandler.success(
            res,
            'Business review created successfully',
            review,
            201
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to create business review');
    }
    }
};
