import Joi from 'joi';
import { Reaction, Review, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity, logHelpfulReactionReceived } from '../../utils/activityTracker.js';

export default {
    validator: validator({
        body: Joi.object({
            reviewId: Joi.string().required(),
            type: Joi.string().valid('helpful', 'not_helpful').required()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const { reviewId, type } = req.body;

            // Check if review exists
            const review = await Review.findById(reviewId);
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check if user already reacted to this review
            let reaction = await Reaction.findOne({ reviewId, userId });

            if (reaction) {
                // Update existing reaction if type changed
                if (reaction.type !== type) {
                    const oldType = reaction.type;
                    reaction.type = type;
                    await reaction.save();

                    // Update review stats
                    if (oldType === 'helpful') {
                        review.stats.helpfulCount -= 1;
                        review.stats.notHelpfulCount += 1;
                    } else {
                        review.stats.notHelpfulCount -= 1;
                        review.stats.helpfulCount += 1;
                    }
                    await review.save();

                    return responseHandler.success(res, 'Reaction updated successfully', reaction);
                } else {
                    // Same reaction, no change
                    return responseHandler.success(res, 'Reaction already exists', reaction);
                }
            }

            // Create new reaction
            reaction = new Reaction({
                reviewId,
                userId,
                type
            });

            await reaction.save();

            // Update review stats
            if (type === 'helpful') {
                review.stats.helpfulCount += 1;
            } else {
                review.stats.notHelpfulCount += 1;
            }
            await review.save();

            // Update user stats (total reactions given)
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalReactions': 1 }
            });

            // Log activity for trust score
            await logActivity(
                userId,
                'reaction',
                { type: 'Reaction', id: reaction._id },
                { reviewId, reactionType: type }
            );

            // If helpful reaction, give bonus to review author
            if (type === 'helpful') {
                await logHelpfulReactionReceived(review.userId.toString(), reviewId);
            }

            return responseHandler.success(res, 'Reaction added successfully', reaction, 201);

        } catch (error) {
            console.error('Add reaction error:', error);
            return responseHandler.error(res, error?.message || 'Failed to add reaction');
        }
    }
};


