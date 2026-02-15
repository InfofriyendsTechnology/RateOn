import { Report, Review, User, Business, Item } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

/**
 * Create a new report
 */
export const createReport = async (req, res) => {
    try {
        const reporterId = req.user.userId;
        const { reportedItemType, reportedItemId, reason, description } = req.body;

        // Validate required fields
        if (!reportedItemType || !reportedItemId || !reason || !description) {
            return responseHandler.error(res, 'Missing required fields', 400);
        }

        // Validate item type
        const validTypes = ['review', 'reply', 'user', 'business', 'item'];
        if (!validTypes.includes(reportedItemType)) {
            return responseHandler.error(res, 'Invalid reported item type', 400);
        }

        // Check if reported item exists
        let itemExists = false;
        switch (reportedItemType) {
            case 'review':
                itemExists = await Review.exists({ _id: reportedItemId });
                break;
            case 'user':
                itemExists = await User.exists({ _id: reportedItemId });
                break;
            case 'business':
                itemExists = await Business.exists({ _id: reportedItemId });
                break;
            case 'item':
                itemExists = await Item.exists({ _id: reportedItemId });
                break;
        }

        if (!itemExists) {
            return responseHandler.error(res, 'Reported item not found', 404);
        }

        // Check if user already reported this item
        const existingReport = await Report.findOne({ reporterId, reportedItemId });
        if (existingReport) {
            return responseHandler.error(res, 'You have already reported this item', 400);
        }

        // Create report
        const report = new Report({
            reporterId,
            reportedItemType,
            reportedItemId,
            reason,
            description
        });

        await report.save();

        return responseHandler.success(res, 'Report submitted successfully', { report }, 201);

    } catch (error) {
        return responseHandler.error(res, 'Failed to create report', 500);
    }
};

/**
 * Get all reports (Admin only) with filters
 */
export const getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // pending, under_review, resolved, rejected
        const type = req.query.type; // review, user, business, item

        const query = {};
        if (status) query.status = status;
        if (type) query.reportedItemType = type;

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('reporterId', 'username profile.firstName profile.lastName profile.avatar')
            .populate('reviewedBy', 'username')
            .lean();

        const totalReports = await Report.countDocuments(query);

        return responseHandler.success(res, 'Reports fetched', {
            reports,
            pagination: {
                page,
                limit,
                total: totalReports,
                totalPages: Math.ceil(totalReports / limit)
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch reports', 500);
    }
};

/**
 * Get single report by ID (Admin only)
 */
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate('reporterId', 'username profile.firstName profile.lastName profile.avatar email')
            .populate('reviewedBy', 'username email')
            .populate('reportedItemId')
            .lean();

        if (!report) {
            return responseHandler.error(res, 'Report not found', 404);
        }

        return responseHandler.success(res, 'Report fetched', { report });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch report', 500);
    }
};

/**
 * Resolve a report (Admin only)
 */
export const resolveReport = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { id } = req.params;
        const { action, note } = req.body;

        // Validate action
        const validActions = ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned'];
        if (!action || !validActions.includes(action)) {
            return responseHandler.error(res, 'Invalid action', 400);
        }

        const report = await Report.findById(id);
        if (!report) {
            return responseHandler.error(res, 'Report not found', 404);
        }

        // Update report
        report.status = 'resolved';
        report.reviewedBy = adminId;
        report.resolution = {
            action,
            note: note || '',
            resolvedAt: new Date()
        };

        await report.save();

        // Apply action
        if (action === 'user_suspended' || action === 'user_banned') {
            // Get the user ID from the reported item
            let userToSuspend;
            if (report.reportedItemType === 'user') {
                userToSuspend = report.reportedItemId;
            } else if (report.reportedItemType === 'review') {
                const review = await Review.findById(report.reportedItemId);
                if (review) userToSuspend = review.userId;
            }

            if (userToSuspend) {
                await User.findByIdAndUpdate(userToSuspend, {
                    isActive: action === 'user_suspended' ? false : false,
                    isBanned: action === 'user_banned'
                });
            }
        } else if (action === 'content_removed') {
            // Soft delete the content
            if (report.reportedItemType === 'review') {
                await Review.findByIdAndUpdate(report.reportedItemId, { isDeleted: true });
            }
        }

        return responseHandler.success(res, 'Report resolved successfully', { report });

    } catch (error) {
        return responseHandler.error(res, 'Failed to resolve report', 500);
    }
};

/**
 * Reject a report (Admin only)
 */
export const rejectReport = async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { id } = req.params;
        const { note } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return responseHandler.error(res, 'Report not found', 404);
        }

        report.status = 'rejected';
        report.reviewedBy = adminId;
        report.resolution = {
            action: 'none',
            note: note || 'Report rejected - no violation found',
            resolvedAt: new Date()
        };

        await report.save();

        return responseHandler.success(res, 'Report rejected successfully', { report });

    } catch (error) {
        return responseHandler.error(res, 'Failed to reject report', 500);
    }
};

/**
 * Get report statistics (Admin only)
 */
export const getReportStats = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const underReviewReports = await Report.countDocuments({ status: 'under_review' });
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });
        const rejectedReports = await Report.countDocuments({ status: 'rejected' });

        // Reports by type
        const reportsByType = await Report.aggregate([
            {
                $group: {
                    _id: '$reportedItemType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Reports by reason
        const reportsByReason = await Report.aggregate([
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 }
                }
            }
        ]);

        return responseHandler.success(res, 'Report statistics fetched', {
            total: totalReports,
            byStatus: {
                pending: pendingReports,
                under_review: underReviewReports,
                resolved: resolvedReports,
                rejected: rejectedReports
            },
            byType: reportsByType,
            byReason: reportsByReason
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch report statistics', 500);
    }
};




