import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');

            if (!user) {
                return responseHandler.error(res, "User not found");
            }

            return responseHandler.success(res, "Profile retrieved successfully", user);

        } catch (error) {
            return responseHandler.error(res, error?.message || "Failed to fetch profile");
        }
    }
}


