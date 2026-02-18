import Joi from 'joi';
import { Notification, Review, Reaction, Reply } from '../../models/index.js';
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

            // Get unique review IDs from notifications
            const reviewIds = notifications
                .filter(n => n.metadata?.reviewId)
                .map(n => n.metadata.reviewId)
                .filter((id, index, self) => self.findIndex(i => i?.toString() === id?.toString()) === index);

            // Fetch review data with replies and user's reactions in parallel
            let reviewsMap = {};
            let userReactionsMap = {};
            
            if (reviewIds.length > 0) {
                try {
                    // Fetch reviews, replies, and user's reactions in parallel
                    const [reviews, replies, userReactions] = await Promise.all([
                        Review.find({ _id: { $in: reviewIds } })
                            .select('rating reviewText comment stats')
                            .lean(),
                        Reply.find({ reviewId: { $in: reviewIds } })
                            .select('reviewId comment text createdAt userId')
                            .sort({ createdAt: -1 })
                            .limit(100)
                            .lean(),
                        Reaction.find({ 
                            reviewId: { $in: reviewIds },
                            userId: userId 
                        })
                            .select('reviewId type')
                            .lean()
                    ]);
                    
                    // Group replies by reviewId
                    const repliesMap = {};
                    if (replies && replies.length > 0) {
                        replies.forEach(reply => {
                            if (reply && reply.reviewId) {
                                const reviewId = reply.reviewId.toString();
                                if (!repliesMap[reviewId]) {
                                    repliesMap[reviewId] = [];
                                }
                                repliesMap[reviewId].push(reply);
                            }
                        });
                    }
                    
                    // Create a map for quick lookup of reviews and add replies
                    if (reviews && reviews.length > 0) {
                        reviewsMap = reviews.reduce((acc, review) => {
                            if (review && review._id) {
                                const reviewId = review._id.toString();
                                // Add replies to review (limit to 5 most recent)
                                review.replies = (repliesMap[reviewId] || []).slice(0, 5);
                                // Calculate reaction counts from stats
                                review.reactions = {
                                    helpful: review.stats?.helpfulCount || 0,
                                    notHelpful: review.stats?.notHelpfulCount || 0
                                };
                                acc[reviewId] = review;
                            }
                            return acc;
                        }, {});
                    }
                    
                    // Create a map for user's reactions
                    if (userReactions && userReactions.length > 0) {
                        userReactionsMap = userReactions.reduce((acc, reaction) => {
                            if (reaction && reaction.reviewId) {
                                acc[reaction.reviewId.toString()] = reaction.type;
                            }
                            return acc;
                        }, {});
                    }
                } catch (reviewError) {
                    console.error('Error fetching review data for notifications:', reviewError);
                    // Continue without review data - notifications will still work
                }
            }

            // Transform notifications to include review data in metadata
            const transformedNotifications = notifications.map(notif => {
                const notifObj = notif.toObject();
                
                // If notification has a reviewId, add review data to metadata
                if (notifObj.metadata?.reviewId) {
                    const reviewId = notifObj.metadata.reviewId.toString();
                    const review = reviewsMap[reviewId];
                    const userReaction = userReactionsMap[reviewId];
                    
                    if (review) {
                        // Add review data to metadata
                        notifObj.metadata.rating = review.rating;
                        notifObj.metadata.reviewText = review.reviewText || review.comment;
                        notifObj.metadata.replies = review.replies || [];
                        notifObj.metadata.replyCount = review.replies?.length || 0;
                        notifObj.metadata.reactions = review.reactions || { helpful: 0, notHelpful: 0 };
                        
                        // Add user's current reaction state
                        notifObj.metadata.userReaction = userReaction || null;
                    }
                }
                
                return notifObj;
            });
            
            return responseHandler.success(
                res,
                'Notifications fetched successfully',
                {
                    notifications: transformedNotifications,
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
            console.error('Error fetching notifications:', error);
            return responseHandler.error(res, error?.message || 'Failed to get notifications');
        }
    }
};
