import Joi from 'joi';
import { Reaction, Review, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity, logHelpfulReactionReceived } from '../../utils/activityTracker.js';
import NotificationService from '../../utils/notificationService.js';

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
            let existingReaction = await Reaction.findOne({ reviewId, userId });

            // If same reaction exists, remove it (toggle off)
            if (existingReaction && existingReaction.type === type) {
                await Reaction.deleteOne({ _id: existingReaction._id });

                // Update review stats
                if (type === 'helpful') {
                    review.stats.helpfulCount = Math.max(0, review.stats.helpfulCount - 1);
                } else {
                    review.stats.notHelpfulCount = Math.max(0, review.stats.notHelpfulCount - 1);
                }
                await review.save();

                // Update user stats
                await User.findByIdAndUpdate(userId, {
                    $inc: { 'stats.totalReactions': -1 }
                });

                return responseHandler.success(res, 'Reaction removed successfully', { 
                    action: 'removed',
                    reviewId,
                    stats: {
                        helpful: review.stats.helpfulCount,
                        notHelpful: review.stats.notHelpfulCount
                    }
                });
            }

            // If different reaction exists, update it
            if (existingReaction && existingReaction.type !== type) {
                const oldType = existingReaction.type;
                existingReaction.type = type;
                await existingReaction.save();

                // Update review stats (swap counts)
                if (oldType === 'helpful') {
                    review.stats.helpfulCount = Math.max(0, review.stats.helpfulCount - 1);
                    review.stats.notHelpfulCount += 1;
                } else {
                    review.stats.notHelpfulCount = Math.max(0, review.stats.notHelpfulCount - 1);
                    review.stats.helpfulCount += 1;
                }
                await review.save();

                // Notify review owner about reaction
                await NotificationService.notifyReviewReaction(existingReaction, review.userId.toString());

                // If changed to helpful, give bonus to review author
                if (type === 'helpful') {
                    await logHelpfulReactionReceived(review.userId.toString(), reviewId);
                }

                return responseHandler.success(res, 'Reaction updated successfully', {
                    action: 'updated',
                    reaction: existingReaction,
                    stats: {
                        helpful: review.stats.helpfulCount,
                        notHelpful: review.stats.notHelpfulCount
                    }
                });
            }

            // Create new reaction
            const newReaction = new Reaction({
                reviewId,
                userId,
                type
            });

            await newReaction.save();

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
                { type: 'Reaction', id: newReaction._id },
                { reviewId, reactionType: type }
            );

            // If helpful reaction, give bonus to review author
            if (type === 'helpful') {
                await logHelpfulReactionReceived(review.userId.toString(), reviewId);
            }

            // Notify review owner about reaction
            await NotificationService.notifyReviewReaction(newReaction, review.userId.toString());

            return responseHandler.success(res, 'Reaction added successfully', {
                action: 'added',
                reaction: newReaction,
                stats: {
                    helpful: review.stats.helpfulCount,
                    notHelpful: review.stats.notHelpfulCount
                }
            }, 201);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to toggle reaction');
        }
    }
};
