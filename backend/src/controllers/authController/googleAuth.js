import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/config.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    callback: async (req, res) => {
        try {
            const frontendUrl = process.env.DEV_MODE === 'true' 
                ? 'http://localhost:5300' 
                : 'https://rateon.vercel.app';
            
            if (!req.user) {
                return res.redirect(`${frontendUrl}/auth/login?error=authentication_failed`);
            }

            const user = req.user;

            const token = jwt.sign({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                userType: 'user'
            }, JWT_SECRET, { expiresIn: '30d' });

            const userResponse = user.toObject();
            delete userResponse.password;

            userResponse.verificationBadges = user.getVerificationBadges();

            // Redirect to frontend with token and user data
            const userData = encodeURIComponent(JSON.stringify({
                token,
                user: userResponse,
                userType: 'user'
            }));

            return res.redirect(`${frontendUrl}/auth/callback?data=${userData}`);

        } catch (error) {
            const frontendUrl = process.env.DEV_MODE === 'true' 
                ? 'http://localhost:5300' 
                : 'https://rateon.vercel.app';
            return res.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent(error?.message || 'authentication_failed')}`);
        }
    }
};


