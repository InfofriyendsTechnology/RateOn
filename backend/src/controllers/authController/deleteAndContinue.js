import { User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            // Get data from request body (sent from frontend)
            const { userId, googleData } = req.body;
            
            if (!userId || !googleData) {
                return responseHandler.error(res, 'Missing required data');
            }

            // Delete the existing user account
            await User.findByIdAndDelete(userId);
            
            // Store Google data for business registration
            req.session.tempGoogleUser = {
                googleId: googleData.googleId,
                email: googleData.email,
                profile: {
                    firstName: googleData.firstName,
                    lastName: googleData.lastName,
                    avatar: googleData.avatar
                }
            };

            return responseHandler.success(
                res, 
                'User account deleted successfully. You can now proceed with business registration.',
                { googleData }
            );

        } catch (error) {
            console.error('Delete and continue error:', error);
            return responseHandler.error(res, error?.message || 'Failed to delete account');
        }
    }
};


