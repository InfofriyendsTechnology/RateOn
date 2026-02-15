import { Business, Review, Reaction } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Get period from query parameter (default: 'month')
            const period = req.query.period || 'month';
            
            // Validate period
            if (!['week', 'month'].includes(period)) {
                return responseHandler.error(res, 'Invalid period. Use "week" or "month"', 400);
            }

            // Calculate date threshold based on period
            let dateThreshold;
            if (period === 'week') {
                dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            } else {
                dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            }

            // Get top businesses by review count in the period
            const topBusinessesByReviews = await Review.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateThreshold }
                    }
                },
                {
                    $group: {
                        _id: "$businessId",
                        reviewCount: { $sum: 1 },
                        averageRating: { $avg: "$rating" }
                    }
                },
                {
                    $sort: { reviewCount: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: 'businesses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'business'
                    }
                },
                {
                    $unwind: "$business"
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'businessId',
                        as: 'allReviews'
                    }
                },
                {
                    $lookup: {
                        from: 'reactions',
                        let: { businessId: '$_id' },
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'reviews',
                                    localField: 'reviewId',
                                    foreignField: '_id',
                                    as: 'review'
                                }
                            },
                            {
                                $unwind: '$review'
                            },
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$review.businessId', '$$businessId'] },
                                            { $gte: ['$createdAt', dateThreshold] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'reactions'
                    }
                },
                {
                    $project: {
                        businessId: "$_id",
                        businessName: "$business.name",
                        businessImage: "$business.images.0",
                        reviewCount: 1,
                        averageRating: { $round: ["$averageRating", 2] },
                        reactionCount: { $size: "$reactions" },
                        totalReviews: { $size: "$allReviews" },
                        _id: 0
                    }
                }
            ]);

            return responseHandler.success(res, `Top businesses for ${period} fetched successfully`, {
                period,
                dateThreshold,
                topBusinesses: topBusinessesByReviews
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch top businesses', 500);
        }
    }
}
