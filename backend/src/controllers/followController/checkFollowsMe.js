import { Follow } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const checkFollowsMe = async (req, res) => {
    try {
        const currentUserId = req.user.id;       // The logged-in user (me)
        const { userId: otherUserId } = req.params;  // The other user to check

        // Does otherUser follow me?
        const followsMe = await Follow.exists({
            followerId: otherUserId,
            followingId: currentUserId
        });

        return responseHandler.success(res, 'Follow status checked', {
            followsMe: !!followsMe
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to check follow status', 500);
    }
};
