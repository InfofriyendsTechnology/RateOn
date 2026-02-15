import { Business, Item, Review } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Business stats
            const totalBusinesses = await Business.countDocuments();
            const claimedBusinesses = await Business.countDocuments({ isClaimed: true });
            const verifiedBusinesses = await Business.countDocuments({ isVerified: true });
            
            // Item stats
            const totalItems = await Item.countDocuments();
            const availableItems = await Item.countDocuments({ 'availability.status': 'available' });
            const outOfStockItems = await Item.countDocuments({ 'availability.status': 'out_of_stock' });

            // Review stats
            const totalReviews = await Review.countDocuments();
            
            // Most reviewed items (top 10)
            const mostReviewedItems = await Review.aggregate([
                { $group: { _id: '$itemId', reviewCount: { $sum: 1 } } },
                { $sort: { reviewCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'items',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'item'
                    }
                },
                { $unwind: '$item' },
                {
                    $project: {
                        itemId: '$_id',
                        itemName: '$item.name',
                        reviewCount: 1,
                        averageRating: '$item.stats.averageRating'
                    }
                }
            ]);

            // Least reviewed items or never reviewed
            const neverReviewedItems = await Item.countDocuments({ 'stats.totalReviews': 0 });

            // Top rated items (rating >= 4.5, minimum 5 reviews)
            const topRatedItems = await Item.find({
                'stats.averageRating': { $gte: 4.5 },
                'stats.totalReviews': { $gte: 5 }
            })
            .sort({ 'stats.averageRating': -1, 'stats.totalReviews': -1 })
            .limit(10)
            .select('name stats.averageRating stats.totalReviews')
            .lean();

            // Recent activity (last 7, 30 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            const reviewsLast7Days = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
            const reviewsLast30Days = await Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
            const businessesLast7Days = await Business.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
            const businessesLast30Days = await Business.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

            return responseHandler.success(res, 'Content analytics fetched', {
                businesses: {
                    total: totalBusinesses,
                    claimed: claimedBusinesses,
                    verified: verifiedBusinesses,
                    recentlyAdded: {
                        last7Days: businessesLast7Days,
                        last30Days: businessesLast30Days
                    }
                },
                items: {
                    total: totalItems,
                    available: availableItems,
                    outOfStock: outOfStockItems,
                    neverReviewed: neverReviewedItems
                },
                reviews: {
                    total: totalReviews,
                    recent: {
                        last7Days: reviewsLast7Days,
                        last30Days: reviewsLast30Days
                    }
                },
                topContent: {
                    mostReviewedItems,
                    topRatedItems
                }
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch content analytics', 500);
        }
    }
}
