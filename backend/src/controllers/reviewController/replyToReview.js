import Joi from 'joi';
import { Review, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import NotificationService from '../../utils/notificationService.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            comment: Joi.string().trim().max(1000).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            const { comment } = req.body;

            // Validate required fields
            if (!comment || !comment.trim()) {
                return responseHandler.badRequest(res, 'Reply comment is required');
            }

            // Find the review
            const review = await Review.findById(reviewId).populate('businessId');
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check if business exists
            const business = await Business.findById(review.businessId);
            if (!business) {
                return responseHandler.notFound(res, 'Business not found');
            }

            // Check if user is the business owner
            if (business.owner.toString() !== userId.toString()) {
                return responseHandler.forbidden(res, 'Only the business owner can reply to reviews');
            }

            // Check if owner has already replied
            if (review.ownerResponse && review.ownerResponse.comment) {
                return responseHandler.conflict(res, 'You have already replied to this review. Please edit your existing response.');
            }

            // Add owner response
            review.ownerResponse = {
                comment: comment.trim(),
                respondedBy: userId,
                respondedAt: new Date()
            };

            await review.save();

            // Create notification for the reviewer
            const reviewerId = review.userId;
            if (reviewerId && reviewerId.toString() !== userId.toString()) {
                await NotificationService.notifyBusinessResponse(
                    {
                        _id: review._id,
                        businessId: review.businessId,
                        itemId: review.itemId,
                        ownerResponse: review.ownerResponse
                    },
                    reviewerId
                );
            }

            // Populate review data for response
            await review.populate([
                { path: 'userId', select: 'username profile.firstName profile.lastName profile.avatar trustScore level' },
                { path: 'ownerResponse.respondedBy', select: 'username profile.firstName profile.lastName profile.avatar' },
                { path: 'itemId', select: 'name images' },
                { path: 'businessId', select: 'name logo' }
            ]);

            return responseHandler.success(
                res,
                'Reply added successfully',
                review
            );

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to reply to review');
        }
    }
};
