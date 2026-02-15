import { ActivityLog } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get user activities with pagination
        const activities = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('relatedEntity.id')
            .lean();

        const totalActivities = await ActivityLog.countDocuments({ userId });

        // Format activities for response
        const formattedActivities = activities.map(activity => ({
            id: activity._id,
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
        return responseHandler.error(res, 'Failed to fetch user activity', 500);
    }
};






