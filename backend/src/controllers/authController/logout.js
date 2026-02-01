import { User, Admin } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const { id, userType } = req.user;

            if (userType === 'admin') {
                await Admin.findByIdAndUpdate(id, { isLoggedIn: false });
            } else {
                await User.findByIdAndUpdate(id, { isLoggedIn: false });
            }

            return responseHandler.success(res, "Logged out successfully");

        } catch (error) {
            return responseHandler.error(res, error?.message || "Logout failed");
        }
    }
}


