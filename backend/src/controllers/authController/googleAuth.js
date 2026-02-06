import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/config.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    callback: async (req, res) => {
        try {
            // Debug logging
            console.log('🔍 DEBUG - FRONTEND_URL:', FRONTEND_URL);
            console.log('🔍 DEBUG - process.env.FRONTEND_URL:', process.env.FRONTEND_URL);
            console.log('🔍 DEBUG - process.env.VERCEL_URL:', process.env.VERCEL_URL);
            
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}/auth/login?error=authentication_failed`);
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

            return res.redirect(`${FRONTEND_URL}/auth/callback?data=${userData}`);

        } catch (error) {
            return res.redirect(`${FRONTEND_URL}/auth/login?error=${encodeURIComponent(error?.message || 'authentication_failed')}`);
        }
    }
};


