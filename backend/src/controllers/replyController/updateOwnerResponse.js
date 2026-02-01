import Joi from 'joi';
import { Review, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

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
            const { reviewId } = req.params;
            const { comment } = req.body;

            // Find review
            const review = await Review.findById(reviewId);
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check if owner response exists
            if (!review.ownerResponse || !review.ownerResponse.comment) {
                return responseHandler.notFound(res, 'No owner response found to update');
            }

            // Check if user owns this business
            const business = await Business.findById(review.businessId);
            if (!business || business.owner.toString() !== userId) {
                return responseHandler.forbidden(res, 'You can only update replies for your own business');
            }

            // Update response
            review.ownerResponse.comment = comment;
            review.ownerResponse.respondedAt = new Date();

            await review.save();
            await review.populate('ownerResponse.respondedBy', 'username profile.firstName profile.lastName');

            return responseHandler.success(res, 'Reply updated successfully', review.ownerResponse);

        } catch (error) {
            console.error('Update owner response error:', error);
            return responseHandler.error(res, error?.message || 'Failed to update reply');
        }
    }
};


