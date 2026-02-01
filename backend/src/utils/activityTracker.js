import ActivityLog, { ACTIVITY_POINTS } from '../models/ActivityLogModel.js';
import { User } from '../models/index.js';

/**
 * Log user activity and update trust score
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity (review, reaction, follow, etc.)
 * @param {Object} relatedEntity - Related entity info { type, id }
 * @param {Object} metadata - Additional activity data
 * @returns {Promise<ActivityLog>}
 */
export const logActivity = async (userId, activityType, relatedEntity = null, metadata = {}) => {
    try {
        // Determine points for this activity
        let points = ACTIVITY_POINTS[activityType] || 0;

        // Bonus points for reviews with photos
        if (activityType === 'review' && metadata.hasPhotos) {
            points = ACTIVITY_POINTS.review_with_photos;
        }

        // Create activity log
        const activity = new ActivityLog({
            userId,
            activityType,
            points,
            relatedEntity,
            metadata
        });

        await activity.save();

        // Update user's trust score
        await updateUserTrustScore(userId, points);

        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
};

/**
 * Update user's trust score
 * @param {string} userId - User ID
 * @param {number} points - Points to add
 */
export const updateUserTrustScore = async (userId, points) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Add points to trust score (max 100)
        user.trustScore = Math.min(100, user.trustScore + points);

        // Update level based on trust score
        user.level = calculateUserLevel(user.trustScore, user.stats.totalReviews);

        await user.save();
    } catch (error) {
        console.error('Error updating trust score:', error);
        throw error;
    }
};

/**
 * Calculate user level based on trust score and activity
 * @param {number} trustScore - Current trust score
 * @param {number} totalReviews - Total reviews written
 * @returns {number} User level (1-10)
 */
export const calculateUserLevel = (trustScore, totalReviews) => {
    // Level system based on trust score and activity
    // Level 1-10 (Bronze to Diamond)
    
    if (trustScore >= 90 && totalReviews >= 100) return 10; // Diamond
    if (trustScore >= 85 && totalReviews >= 75) return 9;   // Platinum
    if (trustScore >= 80 && totalReviews >= 50) return 8;   // Platinum
    if (trustScore >= 75 && totalReviews >= 40) return 7;   // Gold
    if (trustScore >= 70 && totalReviews >= 30) return 6;   // Gold
    if (trustScore >= 65 && totalReviews >= 20) return 5;   // Silver
    if (trustScore >= 60 && totalReviews >= 15) return 4;   // Silver
    if (trustScore >= 55 && totalReviews >= 10) return 3;   // Bronze
    if (trustScore >= 50 && totalReviews >= 5) return 2;    // Bronze
    return 1; // Starter
};

/**
 * Get level badge name
 * @param {number} level - User level
 * @returns {string} Badge name
 */
export const getLevelBadge = (level) => {
    if (level >= 10) return 'Diamond';
    if (level >= 8) return 'Platinum';
    if (level >= 6) return 'Gold';
    if (level >= 4) return 'Silver';
    if (level >= 2) return 'Bronze';
    return 'Starter';
};

/**
 * Recalculate trust score for a user based on all activities
 * @param {string} userId - User ID
 */
export const recalculateTrustScore = async (userId) => {
    try {
        // Get all activities for the user
        const activities = await ActivityLog.find({ userId });

        // Sum up all points
        const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);

        // Calculate consistency bonus (regular activity over time)
        const consistencyBonus = await calculateConsistencyBonus(userId);

        // Base score starts at 50
        const trustScore = Math.min(100, 50 + (totalPoints * 0.1) + consistencyBonus);

        // Update user
        const user = await User.findById(userId);
        if (user) {
            user.trustScore = Math.round(trustScore);
            user.level = calculateUserLevel(user.trustScore, user.stats.totalReviews);
            await user.save();
        }

        return trustScore;
    } catch (error) {
        console.error('Error recalculating trust score:', error);
        throw error;
    }
};

/**
 * Calculate consistency bonus based on regular activity
 * @param {string} userId - User ID
 * @returns {Promise<number>} Bonus points (0-10)
 */
const calculateConsistencyBonus = async (userId) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // Count activities in last 30 days
        const recentActivities = await ActivityLog.countDocuments({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Award bonus for consistent activity
        if (recentActivities >= 30) return 10; // Daily activity
        if (recentActivities >= 20) return 7;  // Very active
        if (recentActivities >= 10) return 5;  // Active
        if (recentActivities >= 5) return 3;   // Regular
        
        return 0;
    } catch (error) {
        console.error('Error calculating consistency bonus:', error);
        return 0;
    }
};

/**
 * Log helpful reaction received (bonus for review author)
 * @param {string} reviewAuthorId - ID of user who wrote the review
 * @param {string} reviewId - Review ID
 */
export const logHelpfulReactionReceived = async (reviewAuthorId, reviewId) => {
    try {
        await logActivity(
            reviewAuthorId,
            'reaction',
            { type: 'Review', id: reviewId },
            { type: 'helpful_received' }
        );

        // Add bonus points for helpful reaction
        await updateUserTrustScore(reviewAuthorId, ACTIVITY_POINTS.helpful_reaction_received);
    } catch (error) {
        console.error('Error logging helpful reaction:', error);
    }
};
