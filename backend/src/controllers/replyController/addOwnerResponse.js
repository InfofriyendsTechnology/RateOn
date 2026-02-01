import Joi from 'joi';
import { Review, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity } from '../../utils/activityTracker.js';

export default {
    validator: validator({
        params: Joi.object({
            reviewId: Joi.string().required()
        }),
        body: Joi.object({
            comment: Joi.string().trim().max(1000).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { reviewId } = req.params;
            const { comment } = req.body;

            // Only business owners can reply
            if (userRole !== 'business_owner') {
                return responseHandler.forbidden(res, 'Only business owners can reply to reviews');
            }

            // Find review
            const review = await Review.findById(reviewId);
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check if user owns this business
            const business = await Business.findById(review.businessId);
            if (!business) {
                return responseHandler.notFound(res, 'Business not found');
            }

            if (business.owner.toString() !== userId) {
                return responseHandler.forbidden(res, 'You can only reply to reviews of your own business');
            }

            // Add owner response
            review.ownerResponse = {
                comment,
                respondedBy: userId,
                respondedAt: new Date()
            };

            await review.save();

            // Log activity for trust score
            await logActivity(
                userId,
                'reply',
                { type: 'Review', id: reviewId },
                { isOwnerResponse: true, businessId: review.businessId }
            );

            // Populate for response
            await review.populate('ownerResponse.respondedBy', 'username profile.firstName profile.lastName');

            return responseHandler.success(res, 'Reply added successfully', review.ownerResponse);

        } catch (error) {
            console.error('Add owner response error:', error);
            return responseHandler.error(res, error?.message || 'Failed to add reply');
        }
    }
};


