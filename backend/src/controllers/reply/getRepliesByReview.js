import Joi from 'joi';
import { Reply } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            reviewId: Joi.string().required()
        }),
        query: Joi.object({
            limit: Joi.number().integer().min(1).max(100).default(50),
            skip: Joi.number().integer().min(0).default(0)
        })
    }),
    handler: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { limit = 50, skip = 0 } = req.query;

            // Fetch all active replies for this review
            const replies = await Reply.find({
                reviewId,
                isActive: true
            })
            .populate({
                path: 'userId',
                select: 'username profile.firstName profile.lastName profile.avatar'
            })
            .sort({ createdAt: 1 }) // Oldest first for natural conversation flow
            .limit(parseInt(limit))
            .skip(parseInt(skip));

            // Get total count for pagination
            const total = await Reply.countDocuments({
                reviewId,
                isActive: true
            });

            // Build threaded structure
            const replyMap = {};
            const topLevelReplies = [];

            // First pass: create map of all replies
            replies.forEach(reply => {
                replyMap[reply._id.toString()] = {
                    ...reply.toObject(),
                    children: []
                };
            });

            // Second pass: organize into tree structure
            replies.forEach(reply => {
                const replyObj = replyMap[reply._id.toString()];
                
                if (reply.parentReplyId) {
                    // This is a nested reply
                    const parentId = reply.parentReplyId.toString();
                    if (replyMap[parentId]) {
                        replyMap[parentId].children.push(replyObj);
                    }
                } else {
                    // This is a top-level reply
                    topLevelReplies.push(replyObj);
                }
            });

            return responseHandler.success(
                res,
                'Replies retrieved successfully',
                {
                    replies: topLevelReplies,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        skip: parseInt(skip),
                        hasMore: skip + replies.length < total
                    }
                }
            );

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to retrieve replies');
        }
    }
};
