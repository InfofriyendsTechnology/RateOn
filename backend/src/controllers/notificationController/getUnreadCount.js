import { Notification } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
  validator: validator({}),
  handler: async (req, res) => {
    try {
      const userId = req.user.id;
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });
      return responseHandler.success(res, 'Unread count fetched', { unreadCount });
    } catch (error) {
      return responseHandler.error(res, error?.message || 'Failed to get unread count');
    }
  }
};
