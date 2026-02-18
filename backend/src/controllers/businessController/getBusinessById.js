import { Business, Item, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const business = await Business.findById(id)
                .populate('owner', 'username profile.firstName profile.lastName profile.avatar')
                .populate('createdBy', 'username');

            if (!business || !business.isActive) {
                return responseHandler.notFound(res, 'Business not found');
            }

            // Increment view count
            business.stats.views += 1;
            await business.save();

            // Calculate comprehensive stats by merging business reviews AND item reviews
            const [businessReviews, items] = await Promise.all([
                Review.find({ 
                    businessId: id, 
                    reviewType: 'business',
                    isActive: true 
                }),
                Item.find({ businessId: id })
            ]);

            // Collect all ratings from business reviews
            const allRatings = [];
            businessReviews.forEach(review => {
                if (review.rating) {
                    allRatings.push(review.rating);
                }
            });

            // Collect ratings from all item reviews
            if (items.length > 0) {
                const itemIds = items.map(item => item._id);
                const itemReviews = await Review.find({
                    itemId: { $in: itemIds },
                    isActive: true
                });

                itemReviews.forEach(review => {
                    if (review.rating) {
                        allRatings.push(review.rating);
                    }
                });
            }

            // Calculate merged statistics
            const totalReviews = allRatings.length;
            const averageRating = totalReviews > 0 
                ? allRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews 
                : 0;

            // Add comprehensive stats to business object
            const businessObj = business.toObject();
            businessObj.comprehensiveStats = {
                totalReviews: totalReviews,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                businessReviewsCount: businessReviews.length,
                itemReviewsCount: allRatings.length - businessReviews.length,
                totalItems: items.length
            };

            // Also update the main stats and rating fields for compatibility
            businessObj.stats.totalReviews = totalReviews;
            businessObj.stats.totalItems = items.length;
            businessObj.rating = averageRating;
            businessObj.averageRating = averageRating;
            businessObj.reviewCount = totalReviews;
            businessObj.itemsCount = items.length;

            return responseHandler.success(res, 'Business retrieved successfully', businessObj);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to retrieve business');
        }
    }
};


