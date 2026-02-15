import Joi from 'joi';
import { Reply, Review } from '../../models/index.js';
import NotificationService from '../../utils/notificationService.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        body: Joi.object({
            reviewId: Joi.string().required(),
            comment: Joi.string().trim().min(1).max(1000).required(),
            parentReplyId: Joi.string().optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { reviewId, comment, parentReplyId } = req.body;
        const userId = req.user.id;


        // Check if review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return responseHandler.notFound(res, 'Review not found');
        }

        // If replying to another reply, check if parent reply exists
        let parentReply = null;
        if (parentReplyId) {
            parentReply = await Reply.findById(parentReplyId);
            if (!parentReply) {
                return responseHandler.notFound(res, 'Parent reply not found');
            }

            // Ensure parent reply belongs to the same review
            if (parentReply.reviewId.toString() !== reviewId) {
                return responseHandler.badRequest(res, 'Parent reply does not belong to this review');
            }
        }

        // Create the reply
        const reply = await Reply.create({
            reviewId,
            userId,
            parentReplyId: parentReplyId || null,
            comment: comment.trim()
        });

        // Update review's reply count
        await Review.findByIdAndUpdate(reviewId, {
            $inc: { 'stats.replyCount': 1 }
        });

        // Populate user info for response
        await reply.populate({
            path: 'userId',
            select: 'username profile.firstName profile.lastName profile.avatar'
        });

        // ===== NOTIFICATION TRIGGERS =====
        
        // Case 1: Replying directly to a review
        if (!parentReplyId) {
            // Notify review owner (if not replying to own review)
            if (review.userId.toString() !== userId.toString()) {
                await NotificationService.notifyReviewReply(
                    reply,
                    review.userId.toString()
                );
            }
            
            // Also notify business owner (if review owner is not business owner)
            const business = await review.populate('businessId');
            if (business.businessId.owner && 
                business.businessId.owner.toString() !== userId.toString() &&
                business.businessId.owner.toString() !== review.userId.toString()) {
                await NotificationService.notifyReviewReply(
                    reply,
                    business.businessId.owner.toString()
                );
            }
        } 
        // Case 2: Replying to another reply (threaded)
        else {
            // Notify parent reply owner
            if (parentReply.userId.toString() !== userId.toString()) {
                await NotificationService.notifyReplyToReply(
                    reply,
                    parentReply.userId.toString()
                );
            }
            
            // Also notify original review owner if different
            if (review.userId.toString() !== userId.toString() &&
                review.userId.toString() !== parentReply.userId.toString()) {
                await NotificationService.notifyReviewReply(
                    reply,
                    review.userId.toString()
                );
            }
        }

        return responseHandler.created(
            res,
            'Reply created successfully',
            reply
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to create reply');
    }
    }
};
