import Joi from 'joi';
import { Reply, Review } from '../../models/index.js';
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

            // Find reply
            const reply = await Reply.findById(id);
            if (!reply) {
                return responseHandler.notFound(res, 'Reply not found');
            }

            // Check if reply is already deleted
            if (!reply.isActive) {
                return responseHandler.notFound(res, 'Reply not found');
            }

            // Check ownership
            if (reply.userId.toString() !== userId.toString()) {
                return responseHandler.forbidden(res, 'You can only delete your own replies');
            }

            // Soft delete the reply
            reply.isActive = false;
            await reply.save();

            // Update review's reply count
            await Review.findByIdAndUpdate(reply.reviewId, {
                $inc: { 'stats.replyCount': -1 }
            });

            return responseHandler.success(
                res,
                'Reply deleted successfully',
                null
            );

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to delete reply');
        }
    }
};
