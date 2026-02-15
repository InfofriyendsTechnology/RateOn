import Joi from 'joi';
import { Review, Reply } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        query: Joi.object({
            replyLimit: Joi.number().integer().min(1).max(100).default(50),
            replySkip: Joi.number().integer().min(0).default(0)
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;
        const { replyLimit = 50, replySkip = 0 } = req.query;

        // Fetch the review with populated fields
        const review = await Review.findOne({ _id: id, isActive: true })
            .populate('userId', 'username profile.firstName profile.lastName profile.avatar trustScore level')
            .populate('itemId', 'name images price availability')
            .populate('businessId', 'name location.address location.city location.state location.country')
            .populate('ownerResponse.respondedBy', 'username profile.firstName profile.lastName')
            .lean();

        if (!review) {
            return responseHandler.notFound(res, 'Review not found');
        }

        // Fetch all active replies for this review
        const replies = await Reply.find({
            reviewId: id,
            isActive: true
        })
        .populate({
            path: 'userId',
            select: 'username profile.firstName profile.lastName profile.avatar trustScore level'
        })
        .sort({ createdAt: 1 }) // Oldest first for natural conversation flow
        .limit(parseInt(replyLimit))
        .skip(parseInt(replySkip));

        // Get total reply count for pagination
        const totalReplies = await Reply.countDocuments({
            reviewId: id,
            isActive: true
        });

        // Build threaded structure
        const replyMap = {};
        const topLevelReplies = [];

        // First pass: create map of all replies
        replies.forEach(reply => {
            replyMap[reply._id.toString()] = {
                ...reply,
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
            'Review with replies retrieved successfully',
            {
                review,
                replies: topLevelReplies,
                replyPagination: {
                    total: totalReplies,
                    limit: parseInt(replyLimit),
                    skip: parseInt(replySkip),
                    hasMore: replySkip + replies.length < totalReplies
                }
            }
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve review with replies');
    }
    }
};
