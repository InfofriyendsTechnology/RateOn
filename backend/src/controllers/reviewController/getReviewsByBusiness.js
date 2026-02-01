import Joi from 'joi';
import { Review } from '../../models/index.js';
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
            rating: Joi.number().min(1).max(5).optional()
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
            rating
        } = req.query;

        const filter = { businessId, isActive: true };
        if (rating) filter.rating = parseInt(rating);

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
            .populate('userId', 'username profile.firstName profile.lastName profile.avatar trustScore level')
            .populate('itemId', 'name images')
            .lean();

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
        console.error('Get reviews by business error:', error);
        return responseHandler.error(res, error?.message || 'Failed to retrieve reviews');
    }
    }
};


