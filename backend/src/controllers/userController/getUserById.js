import { User } from "../../models/index.js";
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

            return responseHandler.success(res, "User profile retrieved successfully", user);

        } catch (error) {
            return responseHandler.error(res, error?.message || "Failed to fetch user profile");
        }
    }
}


