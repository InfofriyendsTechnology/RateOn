import jwt from 'jsonwebtoken';
import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";
import { ROLES } from "../../constants/roles.js";
import { JWT_SECRET } from "../../config/config.js";

export default {
    handler: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler.error(res, "User not found", 404);
            }

            // Check if already business owner
            if (user.role === ROLES.BUSINESS_OWNER) {
                return responseHandler.error(res, "You are already a business owner", 400);
            }

            // Check if admin
            if (user.role === ROLES.ADMIN) {
                return responseHandler.error(res, "Admin accounts cannot be converted to business owners", 403);
            }

            // Update role to business owner
            user.role = ROLES.BUSINESS_OWNER;
            await user.save();

            // Generate new JWT token with updated role
            const tokenPayload = {
                id: user._id,
                username: user.username,
                email: user.email,
                userType: 'user',
                role: user.role,
            };

            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

            const userResponse = user.toObject();
            delete userResponse.password;

            return responseHandler.success(res, "You are now a business owner! You can start adding businesses.", {
                token,
                user: userResponse
            });

        } catch (error) {
            console.error('Become business owner error:', error);
            return responseHandler.error(res, error?.message || "Failed to upgrade to business owner");
        }
    }
}
