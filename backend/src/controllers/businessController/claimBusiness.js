import { Business, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { logActivity } from '../../utils/activityTracker.js';

export default {
    handler: async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const business = await Business.findById(id);

        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

        // Check if business is already claimed
        if (business.isClaimed) {
            return responseHandler.conflict(
                res,
                'Business is already claimed by another user'
            );
        }

        // Update user role to business_owner if not already
        const user = await User.findById(userId);
        if (user && user.role === 'user') {
            user.role = 'business_owner';
            await user.save();
        }

        // Claim the business
        business.owner = userId;
        business.isClaimed = true;
        await business.save();

        // Log activity for trust score
        await logActivity(
            userId,
            'business_claimed',
            { type: 'Business', id: business._id },
            { businessName: business.name }
        );

        return responseHandler.success(res, 'Business claimed successfully. You are now the owner.', business);

    } catch (error) {
        console.error('Claim business error:', error);
        return responseHandler.error(res, error?.message || 'Failed to claim business');
    }
    }
};


