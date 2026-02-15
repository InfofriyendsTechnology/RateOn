import { Notification } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({}),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const result = await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            return responseHandler.success(
                res,
                'All notifications marked as read',
                { modifiedCount: result.modifiedCount || result.nModified || 0 }
            );
        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to mark all as read');
        }
    }
};
