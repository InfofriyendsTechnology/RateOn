import { Follow, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }

        // Get following with pagination
        const following = await Follow.find({ followerId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('followingId', 'username profile.firstName profile.lastName profile.avatar trustScore level stats.totalReviews');

        const totalFollowing = await Follow.countDocuments({ followerId: userId });

        return responseHandler.success(res, 'Following fetched', { following: following.map(f => ({
                user: f.followingId,
                followedAt: f.createdAt
            })),
            pagination: {
                page,
                limit,
                total: totalFollowing,
                totalPages: Math.ceil(totalFollowing / limit)
            }
        });

    } catch (error) {
        console.error('Get following error:', error);
        return responseHandler.error(res, 'Failed to fetch following', 500);
    }
};




