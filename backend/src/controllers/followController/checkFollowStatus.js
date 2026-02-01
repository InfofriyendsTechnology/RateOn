import { Follow } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const checkFollowStatus = async (req, res) => {
    try {
        const followerId = req.user.userId; // Current logged-in user
        const { userId: followingId } = req.params;

        // Check if following
        const isFollowing = await Follow.exists({ followerId, followingId });

        return responseHandler.success(res, 'Follow status checked', {
            isFollowing: !!isFollowing
        });

    } catch (error) {
        console.error('Check follow status error:', error);
        return responseHandler.error(res, 'Failed to check follow status', 500);
    }
};





