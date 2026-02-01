import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            const { token } = req.query;

            if (!token) {
                return responseHandler.error(res, "Verification token is required");
            }

            const user = await User.findOne({
                verificationToken: token,
                verificationTokenExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return responseHandler.error(res, "Invalid or expired verification token");
            }

            user.isEmailVerified = true;
            user.verificationToken = null;
            user.verificationTokenExpiry = null;
            user.trustScore = user.calculateTrustScore();
            await user.save();

            return responseHandler.success(res, "Email verified successfully", {
                isEmailVerified: true,
                trustScore: user.trustScore,
                verificationBadges: user.getVerificationBadges()
            });

        } catch (error) {
            return responseHandler.error(res, error?.message || "Email verification failed");
        }
    }
};


