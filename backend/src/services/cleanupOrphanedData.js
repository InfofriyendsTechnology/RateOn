import { User, Review, Reaction, Reply, Follow, Report, Notification } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.middleware.js';

// Same helper as in profile.js
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        if (
            url.includes('googleusercontent.com') ||
            url.includes('googleapis.com') ||
            !url.includes('cloudinary.com')
        ) return null;

        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        let pathParts = parts.slice(uploadIndex + 1);
        if (pathParts[0] && pathParts[0].startsWith('v')) pathParts = pathParts.slice(1);

        const fullPath = pathParts.join('/');
        return fullPath.substring(0, fullPath.lastIndexOf('.'));
    } catch {
        return null;
    }
};

/**
 * cleanupOrphanedData
 * Finds all records that reference non-existent users and removes them.
 * Also deletes orphaned review images from Cloudinary.
 * Returns a summary of what was deleted.
 */
export const cleanupOrphanedData = async () => {
    try {
        console.log('🧹 Starting orphaned data cleanup...');

        // All currently existing user IDs
        const existingUserIds = await User.find().distinct('_id');

        const stats = {
            reviews: 0,
            reviewImages: 0,
            reactions: 0,
            replies: 0,
            follows: 0,
            reports: 0,
            notifications: 0
        };

        // ── 1. Reviews ─────────────────────────────────────────────────────────
        const orphanedReviews = await Review.find({ userId: { $nin: existingUserIds } });
        for (const review of orphanedReviews) {
            if (review.images?.length) {
                for (const imageUrl of review.images) {
                    const publicId = getPublicIdFromUrl(imageUrl);
                    if (publicId) {
                        await deleteFromCloudinary(publicId);
                        stats.reviewImages++;
                    }
                }
            }
        }
        const reviewDel = await Review.deleteMany({ userId: { $nin: existingUserIds } });
        stats.reviews = reviewDel.deletedCount;

        // ── 2. Reactions ────────────────────────────────────────────────────────
        const reactionDel = await Reaction.deleteMany({ userId: { $nin: existingUserIds } });
        stats.reactions = reactionDel.deletedCount;

        // ── 3. Replies ──────────────────────────────────────────────────────────
        const replyDel = await Reply.deleteMany({ userId: { $nin: existingUserIds } });
        stats.replies = replyDel.deletedCount;

        // ── 4. Follows (either side of the relationship) ────────────────────────
        const followDel = await Follow.deleteMany({
            $or: [
                { followerId:  { $nin: existingUserIds } },
                { followingId: { $nin: existingUserIds } }
            ]
        });
        stats.follows = followDel.deletedCount;

        // ── 5. Reports ──────────────────────────────────────────────────────────
        const reportDel = await Report.deleteMany({ userId: { $nin: existingUserIds } });
        stats.reports = reportDel.deletedCount;

        // ── 6. Notifications ────────────────────────────────────────────────────
        const notifDel = await Notification.deleteMany({ userId: { $nin: existingUserIds } });
        stats.notifications = notifDel.deletedCount;

        // ── Log summary ─────────────────────────────────────────────────────────
        const total =
            stats.reviews + stats.reactions + stats.replies +
            stats.follows + stats.reports + stats.notifications;

        if (total > 0) {
            console.log(
                `✅ Cleanup done: ${stats.reviews} reviews (${stats.reviewImages} images from Cloudinary), ` +
                `${stats.reactions} reactions, ${stats.replies} replies, ` +
                `${stats.follows} follows, ${stats.reports} reports, ` +
                `${stats.notifications} notifications removed.`
            );
        } else {
            console.log('✅ Cleanup done: No orphaned data found.');
        }

        return { success: true, stats };
    } catch (error) {
        console.error('❌ Orphaned data cleanup failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * startCleanupScheduler
 * Runs the cleanup every 24 hours automatically.
 */
export const startCleanupScheduler = () => {
    const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(cleanupOrphanedData, INTERVAL_MS);
    console.log('🕐 Orphan cleanup scheduler started (runs every 24 h)');
};
