import { ActivityLog, Follow } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const getFollowingActivity = async (req, res) => {
    try {
        const userId = req.user.userId; // Current logged-in user
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get list of users the current user is following
        const following = await Follow.find({ followerId: userId }).select('followingId');
        const followingIds = following.map(f => f.followingId);

        if (followingIds.length === 0) {
            return responseHandler.success(res, 'Success', { activities: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        // Get activities from followed users
        const activities = await ActivityLog.find({ 
            userId: { $in: followingIds }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username profile.firstName profile.lastName profile.avatar trustScore level')
            .populate('relatedEntity.id')
            .lean();

        const totalActivities = await ActivityLog.countDocuments({ 
            userId: { $in: followingIds }
        });

        // Format activities for response
        const formattedActivities = activities.map(activity => ({
            id: activity._id,
            user: activity.userId,
            type: activity.activityType,
            points: activity.points,
            createdAt: activity.createdAt,
            relatedEntity: activity.relatedEntity,
            metadata: activity.metadata
        }));

        return responseHandler.success(res, 'Success', { activities: formattedActivities,
            pagination: {
                page,
                limit,
                total: totalActivities,
                totalPages: Math.ceil(totalActivities / limit)
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch following activity', 500);
    }
};






