import Joi from 'joi';
import { Reply } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        body: Joi.object({
            comment: Joi.string().trim().min(1).max(1000).required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const userId = req.user.id;

            // Validation
            if (!comment || comment.trim().length === 0) {
                return responseHandler.badRequest(res, 'Comment is required');
            }

            if (comment.length > 1000) {
                return responseHandler.badRequest(res, 'Comment cannot exceed 1000 characters');
            }

            // Find reply
            const reply = await Reply.findById(id);
            if (!reply) {
                return responseHandler.notFound(res, 'Reply not found');
            }

            // Check if reply is active
            if (!reply.isActive) {
                return responseHandler.notFound(res, 'Reply not found');
            }

            // Check ownership
            if (reply.userId.toString() !== userId.toString()) {
                return responseHandler.forbidden(res, 'You can only edit your own replies');
            }

            // Update reply
            reply.comment = comment.trim();
            reply.isEdited = true;
            reply.editedAt = new Date();
            await reply.save();

            // Populate user info for response
            await reply.populate({
                path: 'userId',
                select: 'username profile.firstName profile.lastName profile.avatar'
            });

            return responseHandler.success(
                res,
                'Reply updated successfully',
                reply
            );

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to update reply');
        }
    }
};
