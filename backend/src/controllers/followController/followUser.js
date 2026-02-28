import { Follow, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { logActivity } from '../../utils/activityTracker.js';
import NotificationService from '../../utils/notificationService.js';

export const followUser = async (req, res) => {
    try {
        const followerId = req.user.id; // Current logged-in user
        const { userId: followingId } = req.params;

        // Validate: Can't follow yourself
        if (followerId === followingId) {
            return responseHandler.error(res, 'You cannot follow yourself', 400);
        }

        // Check if the user to follow exists
        const userToFollow = await User.findById(followingId);
        if (!userToFollow) {
            return responseHandler.notFound(res, 'User not found');
        }

        // Check if already following
        const existingFollow = await Follow.findOne({ followerId, followingId });
        if (existingFollow) {
            return responseHandler.error(res, 'You are already following this user', 400);
        }

        // Create follow relationship
        const follow = new Follow({ followerId, followingId });
        await follow.save();

        // Update follower and following counts
        await User.findByIdAndUpdate(followerId, { $inc: { 'stats.totalFollowing': 1 } });
        await User.findByIdAndUpdate(followingId, { $inc: { 'stats.totalFollowers': 1 } });

        // Log activity for trust score (non-fatal — don't let logging failure break follow)
        try {
            await logActivity(followerId, 'follow', { type: 'Follow', id: follow._id }, { followingId });
        } catch (logErr) {
            console.warn('[followUser] logActivity failed (non-fatal):', logErr.message);
        }

        // Send follow notification (non-fatal)
        try {
            await NotificationService.notifyFollow(followerId, followingId);
        } catch (notifErr) {
            console.warn('[followUser] notifyFollow failed (non-fatal):', notifErr.message);
        }

        return responseHandler.success(res, 'Successfully followed user', {
            follow: {
                followerId,
                followingId,
                createdAt: follow.createdAt
            }
        }, 201);

    } catch (error) {
        console.error('[followUser] Error:', error);
        return responseHandler.error(res, 'Failed to follow user', 500);
    }
};



