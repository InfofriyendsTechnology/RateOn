import Joi from 'joi';
import { Report, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            reason: Joi.string().valid(
                'spam',
                'inappropriate_content',
                'harassment',
                'false_information',
                'offensive_language',
                'other'
            ).required(),
            description: Joi.string().trim().min(10).max(500).required()
        })
    }),
    handler: async (req, res) => {
    try {
        const reporterId = req.user.id;
        const { id: reviewId } = req.params;
        const { reason, description } = req.body;

        // Check if review exists and is active
        const review = await Review.findOne({ _id: reviewId, isActive: true });
        if (!review) {
            return responseHandler.notFound(res, 'Review not found');
        }

        // Prevent users from reporting their own reviews
        if (review.userId.toString() === reporterId) {
            return responseHandler.badRequest(res, 'You cannot report your own review');
        }

        // Check if user already reported this review
        const existingReport = await Report.findOne({
            reporterId,
            reportedItemId: reviewId,
            reportedItemType: 'review'
        });

        if (existingReport) {
            return responseHandler.conflict(res, 'You have already reported this review');
        }

        // Create the report
        const report = new Report({
            reporterId,
            reportedItemType: 'review',
            reportedItemId: reviewId,
            reason,
            description
        });

        await report.save();

        return responseHandler.success(
            res,
            'Review reported successfully. Our team will review it shortly.',
            {
                reportId: report._id,
                reason,
                status: report.status
            },
            201
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to report review');
    }
    }
};
