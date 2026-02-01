import { User, Review, ActivityLog } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { getLevelBadge } from '../../utils/activityTracker.js';

/**
 * Get top reviewers by trust score
 */
export const getTopReviewers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const city = req.query.city; // Optional filter by city

        const query = { role: 'user' };
        if (city) {
            query['profile.location.city'] = city;
        }

        const topReviewers = await User.find(query)
            .sort({ trustScore: -1, 'stats.totalReviews': -1 })
            .limit(limit)
            .select('username profile.firstName profile.lastName profile.avatar profile.location trustScore level stats')
            .lean();

        // Format response with badge names
        const formattedReviewers = topReviewers.map((user, index) => ({
            rank: index + 1,
            userId: user._id,
            username: user.username,
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            avatar: user.profile?.avatar,
            location: user.profile?.location,
            trustScore: user.trustScore,
            level: user.level,
            badge: getLevelBadge(user.level),
            totalReviews: user.stats?.totalReviews || 0,
            totalFollowers: user.stats?.totalFollowers || 0
        }));

        return responseHandler.success(res, 'Top reviewers fetched', {
            leaderboard: formattedReviewers,
            total: formattedReviewers.length
        });

    } catch (error) {
        console.error('Get top reviewers error:', error);
        return responseHandler.error(res, 'Failed to fetch top reviewers', 500);
    }
};

/**
 * Get most active users (by activity count in last 30 days)
 */
export const getMostActiveUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Aggregate activities by user in last 30 days
        const activeUsers = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    activityCount: { $sum: 1 },
                    totalPoints: { $sum: '$points' }
                }
            },
            {
                $sort: { activityCount: -1 }
            },
            {
                $limit: limit
            }
        ]);

        // Populate user details
        const userIds = activeUsers.map(u => u._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select('username profile.firstName profile.lastName profile.avatar trustScore level stats')
            .lean();

        // Create user map for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user;
        });

        // Format response
        const formattedActive = activeUsers.map((activity, index) => {
            const user = userMap[activity._id.toString()];
            return {
                rank: index + 1,
                userId: activity._id,
                username: user?.username,
                firstName: user?.profile?.firstName,
                lastName: user?.profile?.lastName,
                avatar: user?.profile?.avatar,
                trustScore: user?.trustScore,
                level: user?.level,
                badge: getLevelBadge(user?.level || 1),
                activityCount: activity.activityCount,
                pointsEarned: activity.totalPoints,
                totalReviews: user?.stats?.totalReviews || 0
            };
        });

        return responseHandler.success(res, 'Most active users fetched', {
            leaderboard: formattedActive,
            period: 'Last 30 days',
            total: formattedActive.length
        });

    } catch (error) {
        console.error('Get most active users error:', error);
        return responseHandler.error(res, 'Failed to fetch most active users', 500);
    }
};

/**
 * Get top contributors by category (most reviews in specific category)
 */
export const getTopContributorsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        if (!category) {
            return responseHandler.error(res, 'Category parameter is required', 400);
        }

        // Find all reviews in the category
        const topContributors = await Review.aggregate([
            {
                $lookup: {
                    from: 'items',
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            {
                $unwind: '$item'
            },
            {
                $match: {
                    'item.category': category
                }
            },
            {
                $group: {
                    _id: '$userId',
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            },
            {
                $sort: { reviewCount: -1 }
            },
            {
                $limit: limit
            }
        ]);

        // Populate user details
        const userIds = topContributors.map(c => c._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select('username profile.firstName profile.lastName profile.avatar trustScore level stats')
            .lean();

        // Create user map
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user;
        });

        // Format response
        const formattedContributors = topContributors.map((contributor, index) => {
            const user = userMap[contributor._id.toString()];
            return {
                rank: index + 1,
                userId: contributor._id,
                username: user?.username,
                firstName: user?.profile?.firstName,
                lastName: user?.profile?.lastName,
                avatar: user?.profile?.avatar,
                trustScore: user?.trustScore,
                level: user?.level,
                badge: getLevelBadge(user?.level || 1),
                categoryReviews: contributor.reviewCount,
                avgRating: Math.round(contributor.avgRating * 10) / 10,
                totalReviews: user?.stats?.totalReviews || 0
            };
        });

        return responseHandler.success(res, 'Top contributors fetched', {
            category,
            leaderboard: formattedContributors,
            total: formattedContributors.length
        });

    } catch (error) {
        console.error('Get top contributors by category error:', error);
        return responseHandler.error(res, 'Failed to fetch top contributors', 500);
    }
};



