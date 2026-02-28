import { User, Review, Reaction, Reply, Follow, Report, Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { deleteFromCloudinary } from '../../middleware/upload.middleware.js';

// Helper function to extract publicId from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        // Skip Google profile pictures and other external URLs
        if (url.includes('googleusercontent.com') || 
            url.includes('googleapis.com') ||
            !url.includes('cloudinary.com')) {
            return null;
        }
        
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/publicId.ext
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;
        
        // Get everything after 'upload' (skip version if exists)
        let pathParts = parts.slice(uploadIndex + 1);
        if (pathParts[0] && pathParts[0].startsWith('v')) {
            pathParts = pathParts.slice(1); // Skip version number
        }
        
        // Join folder and filename, remove extension
        const fullPath = pathParts.join('/');
        return fullPath.substring(0, fullPath.lastIndexOf('.'));
    } catch (error) {
        return null;
    }
};

// Get user profile
export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.userData._id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return responseHandler.notFound(res, 'User not found');
        }

        return responseHandler.success(res, 'Profile fetched successfully', {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                trustScore: user.trustScore,
                level: user.level,
                profile: user.profile,
                stats: user.stats,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return responseHandler.internalServerError(res, 'Failed to fetch profile');
    }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.userData._id;
        const { firstName, lastName, bio, location, phone, badges } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return responseHandler.notFound(res, 'User not found');
        }

        // Update profile fields
        if (firstName !== undefined) user.profile.firstName = firstName;
        if (lastName !== undefined) user.profile.lastName = lastName;
        if (bio !== undefined) user.profile.bio = bio;
        if (location !== undefined) user.profile.location = location;
        if (phone !== undefined) user.profile.phone = phone;
        
        // Update badges (should be array of badge IDs)
        if (badges && Array.isArray(badges)) {
            user.profile.badges = badges;
        }

        // If avatar uploaded, delete old and update avatar URL
        if (req.uploadedFile) {
            // Delete old avatar from Cloudinary if exists
            if (user.profile.avatar) {
                const oldPublicId = getPublicIdFromUrl(user.profile.avatar);
                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId);
                }
            }
            user.profile.avatar = req.uploadedFile.url;
        }

        await user.save();

        return responseHandler.success(res, 'Profile updated successfully', {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                trustScore: user.trustScore,
                level: user.level,
                profile: user.profile,
                stats: user.stats
            }
        });
    } catch (error) {
        return responseHandler.internalServerError(res, 'Failed to update profile');
    }
};

// Upload avatar only
export const uploadAvatar = async (req, res, next) => {
    try {
        const userId = req.userData._id;

        if (!req.uploadedFile) {
            return responseHandler.badRequest(res, 'No file uploaded');
        }

        const user = await User.findById(userId);

        if (!user) {
            return responseHandler.notFound(res, 'User not found');
        }

        // Delete old avatar from Cloudinary if exists
        if (user.profile.avatar) {
            const oldPublicId = getPublicIdFromUrl(user.profile.avatar);
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId);
            }
        }

        // Update avatar URL
        user.profile.avatar = req.uploadedFile.url;
        await user.save();

        return responseHandler.success(res, 'Avatar uploaded successfully', {
            avatar: req.uploadedFile.url
        });
    } catch (error) {
        return responseHandler.internalServerError(res, 'Failed to upload avatar');
    }
};

// Delete user profile
export const deleteUserProfile = async (req, res, next) => {
    try {
        const userId = req.userData._id;

        const user = await User.findById(userId);

        if (!user) {
            return responseHandler.notFound(res, 'User not found');
        }

        // Delete avatar from Cloudinary if exists
        if (user.profile.avatar) {
            const publicId = getPublicIdFromUrl(user.profile.avatar);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        // 1. Find all user reviews
        const userReviews = await Review.find({ userId });

        // 2. Delete review images from Cloudinary + update item stats for each item review
        for (const review of userReviews) {
            if (review.images && review.images.length > 0) {
                for (const imageUrl of review.images) {
                    const publicId = getPublicIdFromUrl(imageUrl);
                    if (publicId) {
                        await deleteFromCloudinary(publicId);
                    }
                }
            }
            // Update item rating immediately so business recalc sees correct totals
            if (review.itemId) {
                const item = await Item.findById(review.itemId);
                if (item) await item.updateRating(review.rating, 'remove');
            }
        }

        // 3. Collect affected business IDs before deleting reviews
        const affectedBusinessIds = [...new Set(
            userReviews
                .filter(r => r.businessId)
                .map(r => r.businessId.toString())
        )];

        // 4. Hard-delete all user reviews
        await Review.deleteMany({ userId });

        // 5. Recalculate stats for each affected business
        for (const businessId of affectedBusinessIds) {
            const business = await Business.findById(businessId);
            if (!business) continue;

            if (!business.rating) {
                business.rating = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
            }

            // Sum up totals from updated item stats
            const businessItems = await Item.find({ businessId });
            let totalRating = 0;
            let totalReviews = 0;
            businessItems.forEach(item => {
                if (item && item.stats.totalReviews > 0) {
                    totalRating += item.stats.averageRating * item.stats.totalReviews;
                    totalReviews += item.stats.totalReviews;
                }
            });

            // Also include remaining direct business-level reviews
            const remainingBizReviews = await Review.find({ businessId, reviewType: 'business', isActive: true });
            remainingBizReviews.forEach(r => { totalRating += r.rating; totalReviews += 1; });

            // Rebuild rating distribution from all remaining active reviews
            const allRemaining = await Review.find({ businessId, isActive: true });
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            allRemaining.forEach(r => {
                if (r.rating >= 1 && r.rating <= 5)
                    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            });
            business.rating.distribution = distribution;

            if (totalReviews > 0) {
                business.rating.average = Math.min(5, Math.max(0, totalRating / totalReviews));
                business.rating.count = totalReviews;
            } else {
                business.rating.average = 0;
                business.rating.count = 0;
            }
            business.stats = business.stats || {};
            business.stats.totalReviews = totalReviews;
            business.stats.avgRating = business.rating.average;

            await business.save();
        }

        // 2. Delete all reactions by this user
        await Reaction.deleteMany({ userId });

        // 3. Delete all replies by this user
        await Reply.deleteMany({ userId });

        // 4. Update stats on other users before deleting follows
        // Users who were following this user → their totalFollowing should decrease
        const followerDocs = await Follow.find({ followingId: userId }, 'followerId').lean();
        const followerIds = followerDocs.map(f => f.followerId);
        if (followerIds.length > 0) {
            await User.updateMany(
                { _id: { $in: followerIds } },
                { $inc: { 'stats.totalFollowing': -1 } }
            );
        }

        // Users this user was following → their totalFollowers should decrease
        const followingDocs = await Follow.find({ followerId: userId }, 'followingId').lean();
        const followingIds = followingDocs.map(f => f.followingId);
        if (followingIds.length > 0) {
            await User.updateMany(
                { _id: { $in: followingIds } },
                { $inc: { 'stats.totalFollowers': -1 } }
            );
        }

        // Now delete all follow relationships
        await Follow.deleteMany({ $or: [{ followerId: userId }, { followingId: userId }] });

        // 5. Delete all reports by this user
        await Report.deleteMany({ userId });

        // 6. Delete user
        await User.findByIdAndDelete(userId);

        return responseHandler.success(res, 'Profile deleted successfully');
    } catch (error) {
        return responseHandler.internalServerError(res, 'Failed to delete profile');
    }
};


