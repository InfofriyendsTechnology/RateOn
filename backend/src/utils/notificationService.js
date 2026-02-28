import { Notification, User, Business, Review, Reply } from '../models/index.js';
import { emitNotificationToUser, emitUnreadCountUpdate } from '../services/websocket/notificationSocket.js';

/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

class NotificationService {

    /**
     * Create a notification for a new review on business item
     * @param {Object} review - The review object
     * @param {String} businessOwnerId - Business owner's user ID
     */
    static async notifyNewReview(review, businessOwnerId) {
        try {
            // Don't notify if business owner is reviewing their own item
            if (review.userId.toString() === businessOwnerId.toString()) {
                return null;
            }

            const reviewer = await User.findById(review.userId).select('username');
            const business = await Business.findById(review.businessId).select('name');

            const notification = await Notification.create({
                userId: businessOwnerId,
                type: 'new_review',
                entityType: 'review',
                entityId: review._id,
                triggeredBy: review.userId,
                message: `${reviewer.username} left a ${review.rating}-star review on ${business.name}`,
                metadata: {
                    reviewId: review._id,
                    businessId: review.businessId,
                    businessName: business.name,
                    itemId: review.itemId,
                    rating: review.rating
                },
                link: `/business/${review.businessId}`
            });

            // Populate triggeredBy for WebSocket emission
            await notification.populate('triggeredBy', 'username profile.avatar');

            // Emit WebSocket event
            emitNotificationToUser(businessOwnerId.toString(), notification);
            
            return notification;
        } catch (error) {
            return null;
        }
    }

    /**
     * Notify when someone replies to a review
     * @param {Object} reply - The reply object
     * @param {String} reviewOwnerId - Review owner's user ID
     */
    static async notifyReviewReply(reply, reviewOwnerId) {
        try {
            // Don't notify if replying to own review
            if (reply.userId.toString() === reviewOwnerId.toString()) {
                return null;
            }

            const replier = await User.findById(reply.userId).select('username');
            const review = await Review.findById(reply.reviewId);

            const notification = await Notification.create({
                userId: reviewOwnerId,
                type: 'review_reply',
                entityType: 'reply',
                entityId: reply._id,
                triggeredBy: reply.userId,
                message: `${replier.username} replied to your review`,
                metadata: {
                    reviewId: reply.reviewId,
                    replyId: reply._id,
                    businessId: review.businessId,
                    itemId: review.itemId
                },
                link: `/reviews/${reply.reviewId}#reply-${reply._id}`
            });

            // Populate triggeredBy for WebSocket emission
            await notification.populate('triggeredBy', 'username profile.avatar');

            // Emit WebSocket event
            emitNotificationToUser(reviewOwnerId.toString(), notification);
            
            return notification;
        } catch (error) {
            return null;
        }
    }

    /**
     * Notify when someone replies to a reply (threaded replies)
     * @param {Object} reply - The new reply object
     * @param {String} parentReplyOwnerId - Parent reply owner's user ID
     */
    static async notifyReplyToReply(reply, parentReplyOwnerId) {
        try {
            // Don't notify if replying to own reply
            if (reply.userId.toString() === parentReplyOwnerId.toString()) {
                return null;
            }

            const replier = await User.findById(reply.userId).select('username');
            const review = await Review.findById(reply.reviewId);

            const notification = await Notification.create({
                userId: parentReplyOwnerId,
                type: 'reply_to_reply',
                entityType: 'reply',
                entityId: reply._id,
                triggeredBy: reply.userId,
                message: `${replier.username} replied to your comment`,
                metadata: {
                    reviewId: reply.reviewId,
                    replyId: reply._id,
                    businessId: review.businessId,
                    itemId: review.itemId
                },
                link: `/reviews/${reply.reviewId}#reply-${reply._id}`
            });

            // Populate triggeredBy for WebSocket emission
            await notification.populate('triggeredBy', 'username profile.avatar');

            // Emit WebSocket event
            emitNotificationToUser(parentReplyOwnerId.toString(), notification);
            
            return notification;
        } catch (error) {
            return null;
        }
    }

    /**
     * Notify when someone reacts to a review
     * @param {Object} reaction - The reaction object
     * @param {String} reviewOwnerId - Review owner's user ID
     */
    static async notifyReviewReaction(reaction, reviewOwnerId) {
        try {
            // Don't notify if reacting to own review
            if (reaction.userId.toString() === reviewOwnerId.toString()) {
                return null;
            }

            const reactor = await User.findById(reaction.userId).select('username');
            const review = await Review.findById(reaction.reviewId);

            const reactionText = reaction.type === 'helpful' ? 'found your review helpful' : 'reacted to your review';

            const notification = await Notification.create({
                userId: reviewOwnerId,
                type: 'review_reaction',
                entityType: 'reaction',
                entityId: reaction._id,
                triggeredBy: reaction.userId,
                message: `${reactor.username} ${reactionText}`,
                metadata: {
                    reviewId: reaction.reviewId,
                    businessId: review.businessId,
                    itemId: review.itemId,
                    reactionType: reaction.type
                },
                link: `/reviews/${reaction.reviewId}`
            });

            // Populate triggeredBy for WebSocket emission
            await notification.populate('triggeredBy', 'username profile.avatar');

            // Emit WebSocket event
            emitNotificationToUser(reviewOwnerId.toString(), notification);
            
            return notification;
        } catch (error) {
            return null;
        }
    }

    /**
     * Notify when business owner responds to a review
     * @param {Object} review - The review with owner response
     * @param {String} reviewerId - Original reviewer's user ID
     */
    static async notifyBusinessResponse(review, reviewerId) {
        try {
            const business = await Business.findById(review.businessId).select('name');
            const responder = await User.findById(review.ownerResponse.respondedBy).select('username');

            const notification = await Notification.create({
                userId: reviewerId,
                type: 'business_response',
                entityType: 'review',
                entityId: review._id,
                triggeredBy: review.ownerResponse.respondedBy,
                message: `${business.name} responded to your review`,
                metadata: {
                    reviewId: review._id,
                    businessId: review.businessId,
                    itemId: review.itemId
                },
                link: `/reviews/${review._id}`
            });

            // Populate triggeredBy for WebSocket emission
            await notification.populate('triggeredBy', 'username profile.avatar');

            // Emit WebSocket event
            emitNotificationToUser(reviewerId.toString(), notification);
            
            return notification;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get user's notifications
     * @param {String} userId - User ID
     * @param {Object} options - Query options (limit, skip, unreadOnly)
     */
    static async getUserNotifications(userId, options = {}) {
        try {
            const {
                limit = 20,
                skip = 0,
                unreadOnly = false
            } = options;

            const query = { userId };
            if (unreadOnly) {
                query.isRead = false;
            }

            const notifications = await Notification.find(query)
                .populate('triggeredBy', 'username profile.avatar')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const unreadCount = await Notification.countDocuments({
                userId,
                isRead: false
            });

            return {
                notifications,
                unreadCount,
                hasMore: notifications.length === limit
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark notification as read
     * @param {String} notificationId - Notification ID
     * @param {String} userId - User ID (for security)
     */
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            // Get updated unread count and emit
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });
            emitUnreadCountUpdate(userId.toString(), unreadCount);
            
            return notification;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param {String} userId - User ID
     */
    static async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            // Emit unread count update (should be 0)
            emitUnreadCountUpdate(userId.toString(), 0);
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a notification
     * @param {String} notificationId - Notification ID
     * @param {String} userId - User ID (for security)
     */
    static async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndDelete({
                _id: notificationId,
                userId
            });

            // Get updated unread count and emit
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });
            emitUnreadCountUpdate(userId.toString(), unreadCount);
            
            return notification;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Notify a user when someone follows them
     * @param {String} followerId - The user who followed
     * @param {String} followingId - The user who was followed (receives notification)
     */
    static async notifyFollow(followerId, followingId) {
        try {
            if (followerId.toString() === followingId.toString()) return null;

            const follower = await User.findById(followerId).select('username');
            if (!follower) return null;

            const notification = await Notification.create({
                userId: followingId,
                type: 'follow',
                entityType: 'user',
                entityId: followerId,
                triggeredBy: followerId,
                message: `${follower.username} started following you`,
                metadata: { followerId },
                link: `/user/${followerId}`
            });

            await notification.populate('triggeredBy', 'username profile.avatar');
            emitNotificationToUser(followingId.toString(), notification);

            return notification;
        } catch (error) {
            return null;
        }
    }
}

export default NotificationService;
