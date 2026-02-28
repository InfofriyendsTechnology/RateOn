import { Follow, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id; // Current logged-in user
        const { userId: followingId } = req.params;

        // Find and delete the follow relationship
        const follow = await Follow.findOneAndDelete({ followerId, followingId });

        if (!follow) {
            return responseHandler.error(res, 'You are not following this user', 400);
        }

        // Update follower and following counts
        await User.findByIdAndUpdate(followerId, { $inc: { 'stats.totalFollowing': -1 } });
        await User.findByIdAndUpdate(followingId, { $inc: { 'stats.totalFollowers': -1 } });

        return responseHandler.success(res, 'Successfully unfollowed user');

    } catch (error) {
        return responseHandler.error(res, 'Failed to unfollow user', 500);
    }
};



