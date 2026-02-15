import { Follow, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const getFollowers = async (req, res) => {
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

        // Get followers with pagination
        const followers = await Follow.find({ followingId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('followerId', 'username profile.firstName profile.lastName profile.avatar trustScore level stats.totalReviews');

        const totalFollowers = await Follow.countDocuments({ followingId: userId });

        return responseHandler.success(res, 'Followers fetched', { followers: followers.map(f => ({
                user: f.followerId,
                followedAt: f.createdAt
            })),
            pagination: {
                page,
                limit,
                total: totalFollowers,
                totalPages: Math.ceil(totalFollowers / limit)
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch followers', 500);
    }
};




