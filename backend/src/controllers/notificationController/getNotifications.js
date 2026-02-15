import Joi from 'joi';
import { Notification } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        query: Joi.object({
            page: Joi.number().integer().min(1).optional(),
            limit: Joi.number().integer().min(1).max(100).optional(),
            filter: Joi.string().valid('all', 'read', 'unread').optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = Math.max(parseInt(req.query.page || '1', 10), 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
            const filter = (req.query.filter || 'all').toString();

            const query = { userId };
            if (filter === 'unread') query.isRead = false;
            if (filter === 'read') query.isRead = true;

            const [notifications, total, unreadCount] = await Promise.all([
                Notification.find(query)
                    .populate('triggeredBy', 'username profile.avatar')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip((page - 1) * limit),
                Notification.countDocuments(query),
                Notification.countDocuments({ userId, isRead: false })
            ]);

            return responseHandler.success(
                res,
                'Notifications fetched successfully',
                {
                    notifications,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    },
                    unreadCount
                }
            );
        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to get notifications');
        }
    }
};
