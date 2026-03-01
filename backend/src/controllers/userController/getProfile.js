import { User, Follow } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password').lean();

            if (!user) {
                return responseHandler.error(res, "User not found");
            }

            // Fetch real-time follow counts from Follow collection (not cached counter)
            const [realFollowers, realFollowing] = await Promise.all([
                Follow.countDocuments({ followingId: req.user.id }),
                Follow.countDocuments({ followerId: req.user.id })
            ]);

            return responseHandler.success(res, "Profile retrieved successfully", {
                ...user,
                stats: {
                    ...user.stats,
                    totalFollowers: realFollowers,
                    totalFollowing: realFollowing
                }
            });

        } catch (error) {
            return responseHandler.error(res, error?.message || "Failed to fetch profile");
        }
    }
}


