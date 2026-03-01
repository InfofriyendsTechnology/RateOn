import { User, Follow } from "../../models/index.js";
import Business from "../../models/BusinessModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId)
                .select('-password -email -isLoggedIn')
                .lean();

            if (!user) {
                return responseHandler.error(res, "User not found");
            }

            if (!user.isActive) {
                return responseHandler.error(res, "This user account is not active");
            }

            // Fetch real-time follow counts from Follow collection (not cached counter)
            const [realFollowers, realFollowing] = await Promise.all([
                Follow.countDocuments({ followingId: userId }),
                Follow.countDocuments({ followerId: userId })
            ]);

            // Fetch businesses owned by this user
            const businesses = await Business.find({ owner: userId, isActive: true })
                .select('_id name logo category type rating stats')
                .lean();

            return responseHandler.success(res, "User profile retrieved successfully", {
                ...user,
                stats: {
                    ...user.stats,
                    totalFollowers: realFollowers,
                    totalFollowing: realFollowing
                },
                businesses,
                businessCount: businesses.length
            });

        } catch (error) {
            return responseHandler.error(res, error?.message || "Failed to fetch user profile");
        }
    }
}


