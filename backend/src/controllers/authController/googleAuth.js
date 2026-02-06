import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/config.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    callback: async (req, res) => {
        try {
            // Dynamically determine frontend URL based on environment
            let frontendUrl;
            
            // Check if we're on production by looking at the host
            const host = req.get('host') || '';
            const referer = req.get('referer') || '';
            
            // Check if request is from production
            const isProduction = host.includes('vercel.app') || 
                                host.includes('rateon-backend') || 
                                referer.includes('rateon.vercel.app');
            
            if (isProduction) {
                // Production - use production frontend URL
                frontendUrl = 'https://rateon.vercel.app';
            } else {
                // Local development
                frontendUrl = 'http://localhost:5300';
            }
            
            console.log('🔍 DEBUG - Host:', host);
            console.log('🔍 DEBUG - Referer:', referer);
            console.log('🔍 DEBUG - Is Production:', isProduction);
            console.log('🔍 DEBUG - Using Frontend URL:', frontendUrl);
            
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
            // Use same logic for error redirect
            const host = req.get('host') || '';
            const referer = req.get('referer') || '';
            const isProduction = host.includes('vercel.app') || 
                                host.includes('rateon-backend') || 
                                referer.includes('rateon.vercel.app');
            const frontendUrl = isProduction ? 'https://rateon.vercel.app' : 'http://localhost:5300';
            return res.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent(error?.message || 'authentication_failed')}`);
        }
    }
};


