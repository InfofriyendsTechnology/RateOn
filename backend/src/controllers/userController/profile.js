import { User } from '../../models/index.js';
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

        // TODO: Delete all user's related data
        // - Reviews
        // - Reactions
        // - Replies
        // - Follows
        // - Reports
        // This will be implemented when those models are in use

        // Delete user
        await User.findByIdAndDelete(userId);

        return responseHandler.success(res, 'Profile deleted successfully');
    } catch (error) {
        return responseHandler.internalServerError(res, 'Failed to delete profile');
    }
};


