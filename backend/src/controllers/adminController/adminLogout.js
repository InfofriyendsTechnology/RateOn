import Admin from "../../models/AdminModel.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const adminId = req.user.id;

            const admin = await Admin.findById(adminId);
            if (admin) {
                admin.isLoggedIn = false;
                await admin.save();
            }

            return responseHandler.success(res, "Admin logged out successfully");

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
