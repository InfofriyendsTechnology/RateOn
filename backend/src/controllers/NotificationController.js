import Notification from '../models/NotificationModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import AppError from '../utils/AppError.js';

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const userId = req.user._id;

  const query = { userId };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .populate('triggeredBy', 'username name profile')
    .populate('metadata.businessId', 'name')
    .populate('metadata.itemId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    userId,
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({ _id: id, userId });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: { notification }
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    data: { modifiedCount: result.modifiedCount },
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({ _id: id, userId });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Create notification (utility function for internal use)
// @access  Private
export const createNotification = async (data) => {
  try {
    // Check if similar notification already exists (prevent duplicates)
    const existingNotification = await Notification.findOne({
      userId: data.userId,
      type: data.type,
      entityId: data.entityId,
      triggeredBy: data.triggeredBy,
      createdAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
    });

    if (existingNotification) {
      return existingNotification;
    }

    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    throw error;
  }
};
