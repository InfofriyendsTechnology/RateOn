import Joi from 'joi';
import { Review, Item, Business, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Find review
            const review = await Review.findById(id);
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check permission: only review owner or admin can delete
            if (review.userId.toString() !== userId && userRole !== 'admin') {
                return responseHandler.forbidden(res, 'You can only delete your own reviews');
            }

            // Soft delete
            review.isActive = false;
            await review.save();

            // Update item rating (remove this review's contribution)
            const item = await Item.findById(review.itemId);
            if (item) {
                await item.updateRating(review.rating, 'remove');
            }

            // Recalculate business rating
            const business = await Business.findById(review.businessId);
            if (business) {
                const businessItems = await Item.find({ businessId: review.businessId });
                let totalRating = 0;
                let totalReviews = 0;
                
                businessItems.forEach(item => {
                    if (item.reviewCount > 0) {
                        totalRating += item.averageRating * item.reviewCount;
                        totalReviews += item.reviewCount;
                    }
                });

                business.rating.average = totalReviews > 0 ? totalRating / totalReviews : 0;
                business.rating.count = totalReviews;
                
                // Update rating distribution
                const allReviews = await Review.find({ businessId: review.businessId, isActive: true });
                const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                allReviews.forEach(r => {
                    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                });
                business.rating.distribution = distribution;
                
                await business.save();
            }

            // Update user stats
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalReviews': -1 }
            });

            return responseHandler.success(res, 'Review deleted successfully');

        } catch (error) {
            console.error('Delete review error:', error);
            return responseHandler.error(res, error?.message || 'Failed to delete review');
        }
    }
};


