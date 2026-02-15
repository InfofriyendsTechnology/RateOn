import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const business = await Business.findById(id)
                .populate('owner', 'username profile.firstName profile.lastName profile.avatar')
                .populate('createdBy', 'username');

        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

            // Increment view count
            business.stats.views += 1;
            await business.save();

            return responseHandler.success(res, 'Business retrieved successfully', business);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to retrieve business');
        }
    }
};


