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

            // Handle item review
            if (review.itemId) {
                // Update item rating (remove this review's contribution)
                const item = await Item.findById(review.itemId);
                if (item) {
                    await item.updateRating(review.rating, 'remove');
                }

                // Recalculate business rating from items
                const business = await Business.findById(review.businessId);
                if (business) {
                    const businessItems = await Item.find({ businessId: review.businessId });
                    let totalRating = 0;
                    let totalReviews = 0;
                    
                    businessItems.forEach(item => {
                        if (item && item.reviewCount > 0 && item.averageRating) {
                            totalRating += item.averageRating * item.reviewCount;
                            totalReviews += item.reviewCount;
                        }
                    });

                    // Initialize rating object if it doesn't exist
                    if (!business.rating) {
                        business.rating = {
                            average: 0,
                            count: 0,
                            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                        };
                    }

                    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
                    // Ensure rating stays within 0-5 range
                    business.rating.average = Math.min(5, Math.max(0, avgRating));
                    business.rating.count = totalReviews;
                    
                    // Update rating distribution
                    const allReviews = await Review.find({ businessId: review.businessId, isActive: true });
                    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    allReviews.forEach(r => {
                        if (r && r.rating >= 1 && r.rating <= 5) {
                            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                        }
                    });
                    business.rating.distribution = distribution;
                    
                    // Also sync to stats.avgRating for backward compatibility
                    business.stats.avgRating = business.rating.average;
                    business.stats.totalReviews = totalReviews;
                    
                    await business.save();
                }
            }
            // Handle business review
            else if (review.reviewType === 'business') {
                const business = await Business.findById(review.businessId);
                if (business) {
                    // Recalculate from remaining business reviews
                    const businessReviews = await Review.find({ businessId: review.businessId, reviewType: 'business', isActive: true });
                    
                    // Initialize rating object if it doesn't exist
                    if (!business.rating) {
                        business.rating = {
                            average: 0,
                            count: 0,
                            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                        };
                    }
                    
                    if (businessReviews.length > 0) {
                        const totalRating = businessReviews.reduce((sum, r) => sum + r.rating, 0);
                        const avgRating = totalRating / businessReviews.length;
                        
                        // Update rating distribution
                        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        businessReviews.forEach(r => {
                            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                        });
                        
                        business.rating.average = avgRating;
                        business.rating.count = businessReviews.length;
                        business.rating.distribution = distribution;
                        business.stats = business.stats || {};
                        business.stats.totalReviews = businessReviews.length;
                        business.stats.avgRating = avgRating;
                    } else {
                        // No more reviews
                        business.rating.average = 0;
                        business.rating.count = 0;
                        business.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        business.stats = business.stats || {};
                        business.stats.totalReviews = 0;
                        business.stats.avgRating = 0;
                    }
                    
                    await business.save();
                }
            }

            // Update user stats
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalReviews': -1 }
            });

            return responseHandler.success(res, 'Review deleted successfully');

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to delete review');
        }
    }
};


