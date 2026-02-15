import Joi from 'joi';
import mongoose from 'mongoose';
import { Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            userId: Joi.string().required()
        }),
        query: Joi.object({
            page: Joi.number().min(1).optional(),
            limit: Joi.number().min(1).max(100).optional(),
            sortBy: Joi.string().valid('createdAt', 'rating').optional(),
            order: Joi.string().valid('asc', 'desc').optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return responseHandler.error(res, 'Invalid user ID format', 400);
        }

        const filter = { userId, isActive: true };

        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('itemId', 'name images')
            .populate('businessId', 'name location.city')
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
        return responseHandler.error(res, error?.message || 'Failed to retrieve reviews');
    }
    }
};


