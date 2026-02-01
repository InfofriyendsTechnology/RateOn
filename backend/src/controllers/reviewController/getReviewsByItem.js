import Joi from 'joi';
import { Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            itemId: Joi.string().required()
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
        const { itemId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            order = 'desc',
            rating,
            minRating,
            maxRating
        } = req.query;

        // Build filter
        const filter = { itemId, isActive: true };

        if (rating) {
            filter.rating = parseInt(rating);
        }
        if (minRating) {
            filter.rating = { ...filter.rating, $gte: parseInt(minRating) };
        }
        if (maxRating) {
            filter.rating = { ...filter.rating, $lte: parseInt(maxRating) };
        }

        // Build sort
        const sort = {};
        if (sortBy === 'helpful') {
            sort['stats.helpfulCount'] = order === 'asc' ? 1 : -1;
        } else if (sortBy === 'rating') {
            sort.rating = order === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = order === 'asc' ? 1 : -1;
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'username profile.firstName profile.lastName profile.avatar trustScore level')
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
        console.error('Get reviews by item error:', error);
        return responseHandler.error(res, error?.message || 'Failed to retrieve reviews');
    }
    }
};


