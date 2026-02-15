import { Review, Reaction, Reply } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Total reviews count
            const totalReviews = await Review.countDocuments();

            // Average rating across all reviews
            const ratingAggregation = await Review.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);
            const averageRating = ratingAggregation.length > 0 
                ? parseFloat(ratingAggregation[0].averageRating.toFixed(2))
                : 0;

            // Reviews by rating (1 to 5 stars)
            const byRating = await Review.aggregate([
                {
                    $group: {
                        _id: "$rating",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            const ratingStats = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            };
            byRating.forEach(item => {
                if (item._id) {
                    ratingStats[item._id] = item.count;
                }
            });

            // Total reactions count
            const totalReactions = await Reaction.countDocuments();

            // Reactions by type
            const reactionsByType = await Reaction.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const reactionStats = {
                helpful: 0,
                not_helpful: 0
            };
            reactionsByType.forEach(item => {
                if (item._id) {
                    reactionStats[item._id] = item.count;
                }
            });

            // Total replies count
            const totalReplies = await Reply.countDocuments();

            return responseHandler.success(res, 'Review statistics fetched successfully', {
                totalReviews,
                averageRating,
                byRating: ratingStats,
                totalReactions,
                reactionsByType: reactionStats,
                totalReplies
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch review statistics', 500);
        }
    }
}
