import Joi from 'joi';
import { Reaction, Review, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            reviewId: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const { reviewId } = req.params;

            // Find and delete reaction
            const reaction = await Reaction.findOneAndDelete({ reviewId, userId });

            if (!reaction) {
                return responseHandler.notFound(res, 'Reaction not found');
            }

            // Update review stats
            const review = await Review.findById(reviewId);
            if (review) {
                if (reaction.type === 'helpful') {
                    review.stats.helpfulCount = Math.max(0, review.stats.helpfulCount - 1);
                } else {
                    review.stats.notHelpfulCount = Math.max(0, review.stats.notHelpfulCount - 1);
                }
                await review.save();
            }

            // Update user stats
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalReactions': -1 }
            });

            return responseHandler.success(res, 'Reaction removed successfully');

        } catch (error) {
            console.error('Remove reaction error:', error);
            return responseHandler.error(res, error?.message || 'Failed to remove reaction');
        }
    }
};


