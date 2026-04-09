import bcrypt from 'bcrypt';
import { User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id || req.user._id;

            if (!currentPassword || !newPassword) {
                return responseHandler.error(res, 'Current password and new password are required', 400);
            }

            if (newPassword.length < 6) {
                return responseHandler.error(res, 'New password must be at least 6 characters', 400);
            }

            // Fetch user — password is not select:false so no +password needed
            const user = await User.findById(userId);
            if (!user) {
                return responseHandler.error(res, 'User not found', 404);
            }

            // Check if user has a password (Google-only users don't)
            if (!user.password) {
                return responseHandler.error(res, 'Your account uses Google login. Use "Set Password" instead.', 400);
            }

            // Verify current password using the model's comparePassword method
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return responseHandler.error(res, 'Current password is incorrect', 401);
            }

            // Set plain new password — the UserModel pre-save hook will hash it
            user.password = newPassword;
            await user.save();

            return responseHandler.success(res, 'Password changed successfully');
        } catch (error) {
            console.error('[changePassword]', error);
            return responseHandler.error(res, error?.message || 'Failed to change password');
        }
    }
};

