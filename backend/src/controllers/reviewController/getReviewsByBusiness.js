import Joi from 'joi';
import { Review, Reply, Reaction } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            businessId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().min(1).optional(),
            limit: Joi.number().min(1).max(100).optional(),
            sortBy: Joi.string().valid('createdAt', 'rating', 'helpful').optional(),
            order: Joi.string().valid('asc', 'desc').optional(),
            rating: Joi.number().min(1).max(5).optional(),
            reviewType: Joi.string().valid('business', 'item').optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { businessId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            order = 'desc',
            rating,
            reviewType
        } = req.query;

        const filter = { businessId, isActive: true };
        if (rating) filter.rating = parseInt(rating);
        if (reviewType) filter.reviewType = reviewType;

        const sort = {};
        if (sortBy === 'helpful') {
            sort['stats.helpfulCount'] = order === 'asc' ? 1 : -1;
        } else if (sortBy === 'rating') {
            sort.rating = order === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = order === 'asc' ? 1 : -1;
        }

        const skip = (page - 1) * limit;
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name username profile trustScore level registrationMethod isEmailVerified')
            .populate('itemId', 'name images')
            .lean();

        // Fetch replies and reactions for each review
        for (let review of reviews) {
            const replies = await Reply.find({
                reviewId: review._id,
                isActive: true
            })
            .populate('userId', 'name username profile')
            .sort({ createdAt: 1 })
            .lean();
            
            // Get reaction counts
            const helpfulCount = await Reaction.countDocuments({ reviewId: review._id, type: 'helpful' });
            const notHelpfulCount = await Reaction.countDocuments({ reviewId: review._id, type: 'not_helpful' });
            
            review.replies = replies;
            review.replyCount = replies.length;
            review.reactions = {
                helpful: helpfulCount,
                notHelpful: notHelpfulCount
            };
        }

        const total = await Review.countDocuments(filter);

        return responseHandler.success(res, 'Reviews retrieved successfully', {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve reviews');
    }
    }
};


