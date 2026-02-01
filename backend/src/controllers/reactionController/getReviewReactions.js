import Joi from 'joi';
import { Reaction } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            reviewId: Joi.string().required()
        }),
        query: Joi.object({
            type: Joi.string().valid('helpful', 'not_helpful').optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { type } = req.query;

            const filter = { reviewId };
            if (type) filter.type = type;

            const reactions = await Reaction.find(filter)
                .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
                .sort({ createdAt: -1 })
                .lean();

            // Get reaction counts
            const helpfulCount = await Reaction.countDocuments({ reviewId, type: 'helpful' });
            const notHelpfulCount = await Reaction.countDocuments({ reviewId, type: 'not_helpful' });

            return responseHandler.success(res, 'Reactions retrieved successfully', {
                reactions,
                stats: {
                    helpful: helpfulCount,
                    notHelpful: notHelpfulCount,
                    total: helpfulCount + notHelpfulCount
                }
            });

        } catch (error) {
            console.error('Get review reactions error:', error);
            return responseHandler.error(res, error?.message || 'Failed to retrieve reactions');
        }
    }
};


