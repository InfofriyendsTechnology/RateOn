import { Business, Item } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Total businesses count
            const totalBusinesses = await Business.countDocuments();

            // Claimed vs unclaimed businesses
            const claimedBusinesses = await Business.countDocuments({ isClaimed: true });
            const unclaimedBusinesses = totalBusinesses - claimedBusinesses;

            // Verified businesses
            const verifiedBusinesses = await Business.countDocuments({ isVerified: true });

            // Active businesses (have at least one item)
            const activeBusinesses = await Business.aggregate([
                {
                    $lookup: {
                        from: 'items',
                        localField: '_id',
                        foreignField: 'businessId',
                        as: 'items'
                    }
                },
                {
                    $match: {
                        items: { $ne: [], $exists: true }
                    }
                },
                {
                    $count: 'count'
                }
            ]);
            const activeBusinessCount = activeBusinesses.length > 0 ? activeBusinesses[0].count : 0;

            // Total items count
            const totalItems = await Item.countDocuments();

            // Items by availability status
            const itemsByAvailability = await Item.aggregate([
                {
                    $group: {
                        _id: "$availability.status",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const availabilityStats = {
                available: 0,
                out_of_stock: 0,
                discontinued: 0
            };
            itemsByAvailability.forEach(item => {
                if (item._id) {
                    availabilityStats[item._id] = item.count;
                }
            });

            // Businesses by category (top 10 categories)
            const businessesByCategory = await Business.aggregate([
                {
                    $unwind: "$categories"
                },
                {
                    $group: {
                        _id: "$categories",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                {
                    $project: {
                        categoryId: "$_id",
                        categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return responseHandler.success(res, 'Business statistics fetched successfully', {
                totalBusinesses,
                claimed: claimedBusinesses,
                unclaimed: unclaimedBusinesses,
                verified: verifiedBusinesses,
                active: activeBusinessCount,
                items: {
                    total: totalItems,
                    byAvailability: availabilityStats
                },
                topCategories: businessesByCategory
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch business statistics', 500);
        }
    }
}
