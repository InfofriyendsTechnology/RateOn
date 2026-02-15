import { User, Review, Reaction, ActivityLog } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Get today's date range (start of today to now)
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const now = new Date();

            // Users registered today
            const usersToday = await User.countDocuments({
                createdAt: { $gte: startOfToday }
            });

            // Reviews submitted today
            const reviewsToday = await Review.countDocuments({
                createdAt: { $gte: startOfToday }
            });

            // Reactions added today
            const reactionsToday = await Reaction.countDocuments({
                createdAt: { $gte: startOfToday }
            });

            // Active users in last 15 minutes
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            // Check if ActivityLog exists and has recent activity
            let activeUsersNow = 0;
            try {
                activeUsersNow = await ActivityLog.distinct('userId', {
                    createdAt: { $gte: fifteenMinutesAgo }
                }).then(userIds => userIds.length);
            } catch (error) {
                // If ActivityLog doesn't exist or has issues, use logged in users instead
                activeUsersNow = await User.countDocuments({
                    isLoggedIn: true,
                    updatedAt: { $gte: fifteenMinutesAgo }
                });
            }

            // Recent registrations in last hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const usersLastHour = await User.countDocuments({
                createdAt: { $gte: oneHourAgo }
            });

            // Recent reviews in last hour
            const reviewsLastHour = await Review.countDocuments({
                createdAt: { $gte: oneHourAgo }
            });

            // Peak hour statistics (reviews per hour for last 24 hours)
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const reviewsByHour = await Review.aggregate([
                {
                    $match: {
                        createdAt: { $gte: twentyFourHoursAgo }
                    }
                },
                {
                    $group: {
                        _id: { 
                            $hour: "$createdAt"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 1
                }
            ]);

            const peakHour = reviewsByHour.length > 0 ? {
                hour: reviewsByHour[0]._id,
                reviewCount: reviewsByHour[0].count
            } : null;

            return responseHandler.success(res, 'Real-time metrics fetched successfully', {
                today: {
                    newUsers: usersToday,
                    newReviews: reviewsToday,
                    newReactions: reactionsToday,
                    date: startOfToday
                },
                lastHour: {
                    newUsers: usersLastHour,
                    newReviews: reviewsLastHour
                },
                realTime: {
                    activeUsersNow,
                    lastChecked: now
                },
                peakHour,
                refreshedAt: now
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch real-time metrics', 500);
        }
    }
}
