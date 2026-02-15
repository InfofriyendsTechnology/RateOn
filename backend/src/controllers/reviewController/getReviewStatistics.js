import Joi from 'joi';
import { Review, Reply, Reaction } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;

        // Check if review exists
        const review = await Review.findOne({ _id: id, isActive: true });
        if (!review) {
            return responseHandler.notFound(res, 'Review not found');
        }

        // Get reply count
        const replyCount = await Reply.countDocuments({
            reviewId: id,
            isActive: true
        });

        // Get reaction statistics
        const reactionStats = await Reaction.aggregate([
            {
                $match: {
                    reviewId: review._id
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format reaction stats
        const reactionCounts = {
            helpful: 0,
            not_helpful: 0,
            total: 0
        };

        reactionStats.forEach(stat => {
            if (stat._id === 'helpful') {
                reactionCounts.helpful = stat.count;
            } else if (stat._id === 'not_helpful') {
                reactionCounts.not_helpful = stat.count;
            }
            reactionCounts.total += stat.count;
        });

        // Calculate helpfulness percentage
        const helpfulnessPercentage = reactionCounts.total > 0
            ? Math.round((reactionCounts.helpful / reactionCounts.total) * 100)
            : 0;

        // Get user's reaction if user is authenticated
        let userReaction = null;
        if (req.user) {
            const userReactionDoc = await Reaction.findOne({
                reviewId: id,
                userId: req.user.id
            });
            userReaction = userReactionDoc ? userReactionDoc.type : null;
        }

        return responseHandler.success(
            res,
            'Review statistics retrieved successfully',
            {
                reviewId: id,
                rating: review.rating,
                replies: {
                    count: replyCount
                },
                reactions: {
                    helpful: reactionCounts.helpful,
                    not_helpful: reactionCounts.not_helpful,
                    total: reactionCounts.total,
                    helpfulnessPercentage
                },
                userReaction,
                engagement: {
                    totalInteractions: replyCount + reactionCounts.total,
                    hasOwnerResponse: !!review.ownerResponse?.response
                }
            }
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve review statistics');
    }
    }
};
