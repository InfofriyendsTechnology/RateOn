import Joi from 'joi';
import { Reaction } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            userId: Joi.string().required()
        }),
        query: Joi.object({
            type: Joi.string().valid('helpful', 'not_helpful').optional(),
            limit: Joi.number().integer().min(1).max(100).default(20),
            skip: Joi.number().integer().min(0).default(0)
        })
    }),
    handler: async (req, res) => {
        try {
            const { userId } = req.params;
            const { type, limit = 20, skip = 0 } = req.query;

            const filter = { userId };
            if (type) filter.type = type;

            const reactions = await Reaction.find(filter)
                .populate('reviewId', 'rating content itemId businessId userId stats')
                .populate({
                    path: 'reviewId',
                    populate: [
                        { path: 'itemId', select: 'name images' },
                        { path: 'businessId', select: 'name location' }
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean();

            const totalCount = await Reaction.countDocuments(filter);

            // Get reaction type counts
            const helpfulCount = await Reaction.countDocuments({ userId, type: 'helpful' });
            const notHelpfulCount = await Reaction.countDocuments({ userId, type: 'not_helpful' });

            return responseHandler.success(res, 'User reactions retrieved successfully', {
                reactions,
                pagination: {
                    total: totalCount,
                    limit,
                    skip,
                    hasMore: skip + reactions.length < totalCount
                },
                stats: {
                    helpful: helpfulCount,
                    notHelpful: notHelpfulCount,
                    total: helpfulCount + notHelpfulCount
                }
            });

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to retrieve user reactions');
        }
    }
};
