import { Business, Item, Review } from '../models/index.js';
import responseHandler from '../utils/responseHandler.js';

// Public endpoint to get platform statistics
export const getPlatformStats = async (req, res) => {
    try {
        // Get counts in parallel for better performance
        const [totalBusinesses, totalItems, totalReviews] = await Promise.all([
            Business.countDocuments({ isActive: true }),
            Item.countDocuments({ isActive: true }),
            Review.countDocuments()
        ]);

        return responseHandler.success(res, 'Platform statistics fetched successfully', {
            totalBusinesses,
            totalItems,
            totalReviews
        });

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to fetch platform statistics');
    }
};
