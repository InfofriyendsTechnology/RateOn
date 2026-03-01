import jwt from 'jsonwebtoken';
import { User, Business, Review, Item, Report } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { JWT_SECRET } from '../../config/config.js';
import adminLogin from './adminLogin.js';
import adminLogout from './adminLogout.js';
import getUserAnalytics from './getUserAnalytics.js';
import getContentAnalytics from './getContentAnalytics.js';
import getUserStatistics from './getUserStatistics.js';
import getReviewStatistics from './getReviewStatistics.js';
import getBusinessStatistics from './getBusinessStatistics.js';
import getTopBusinesses from './getTopBusinesses.js';
import getLocationData from './getLocationData.js';
import getRealTimeMetrics from './getRealTimeMetrics.js';

export { 
    adminLogin, 
    adminLogout, 
    getUserAnalytics, 
    getContentAnalytics,
    getUserStatistics,
    getReviewStatistics,
    getBusinessStatistics,
    getTopBusinesses,
    getLocationData,
    getRealTimeMetrics
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async (req, res) => {
    try {
        // User stats
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalBusinessOwners = await User.countDocuments({ role: 'business_owner' });
        const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

        // Business stats
        const totalBusinesses = await Business.countDocuments();
        const claimedBusinesses = await Business.countDocuments({ isClaimed: true });
        const verifiedBusinesses = await Business.countDocuments({ isVerified: true });

        // Review stats
        const totalReviews = await Review.countDocuments();
        const totalItems = await Item.countDocuments();

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo }
        });
        const recentReviews = await Review.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Report stats
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });

        return responseHandler.success(res, 'Platform stats fetched', { users: {
                total: totalUsers,
                businessOwners: totalBusinessOwners,
                active: activeUsers,
                recentSignups: recentUsers
            },
            businesses: {
                total: totalBusinesses,
                claimed: claimedBusinesses,
                verified: verifiedBusinesses
            },
            content: {
                totalReviews,
                totalItems,
                recentReviews
            },
            moderation: {
                totalReports,
                pendingReports
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch platform statistics', 500);
    }
};

/**
 * Get all users with filters (Admin only)
 */
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const role = req.query.role; // user, business_owner
        const status = req.query.status; // active, suspended

        const search = req.query.search;
        const query = {};
        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'suspended') query.isActive = false;
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password')
            .lean();

        const totalUsers = await User.countDocuments(query);

        return responseHandler.success(res, 'Users fetched', { users,
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch users', 500);
    }
};

/**
 * Suspend a user (Admin only)
 */
export const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, duration } = req.body; // duration in days

        const user = await User.findById(id);
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }

        if (user.role === 'admin') {
            return responseHandler.error(res, 'Cannot suspend admin users', 403);
        }

        user.isActive = false;
        user.suspensionInfo = {
            reason: reason || 'Violation of community guidelines',
            suspendedAt: new Date(),
            suspendedUntil: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
        };

        await user.save();

        return responseHandler.success(res, 'User suspended successfully', { user: {
                id: user._id,
                username: user.username,
                isActive: user.isActive,
                suspensionInfo: user.suspensionInfo
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to suspend user', 500);
    }
};

/**
 * Unsuspend a user (Admin only)
 */
export const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }

        user.isActive = true;
        user.suspensionInfo = undefined;

        await user.save();

        return responseHandler.success(res, 'User unsuspended successfully', { user: {
                id: user._id,
                username: user.username,
                isActive: user.isActive
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to unsuspend user', 500);
    }
};

/**
 * Ban a user permanently (Admin only)
 */
export const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }

        if (user.role === 'admin') {
            return responseHandler.error(res, 'Cannot ban admin users', 403);
        }

        user.isActive = false;
        user.isBanned = true;
        user.banInfo = {
            reason: reason || 'Severe violation of community guidelines',
            bannedAt: new Date()
        };

        await user.save();

        return responseHandler.success(res, 'User banned successfully', { user: {
                id: user._id,
                username: user.username,
                isActive: user.isActive,
                isBanned: user.isBanned
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to ban user', 500);
    }
};

/**
 * Login as any user — generate a JWT on their behalf (Admin only)
 */
export const loginAsUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) return responseHandler.error(res, 'User not found', 404);
        if (!user.isActive) return responseHandler.error(res, 'User account is inactive', 400);

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email,
                username: user.username,
                impersonated: true,
                impersonatedBy: req.user.id
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return responseHandler.success(res, 'Login token generated', { token, user });
    } catch (error) {
        return responseHandler.error(res, 'Failed to generate login token', 500);
    }
};

/**
 * Get user details (Admin only)
 */
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password').lean();
        if (!user) {
            return responseHandler.error(res, 'User not found', 404);
        }

        // Get user's reviews count
        const reviewCount = await Review.countDocuments({ userId: id });

        // Get user's businesses if business owner
        let businesses = [];
        if (user.role === 'business_owner') {
            businesses = await Business.find({ owner: id }).select('name isClaimed isVerified').lean();
        }

        // Get reports against user
        const reportCount = await Report.countDocuments({ 
            reportedItemType: 'user', 
            reportedItemId: id 
        });

        return responseHandler.success(res, 'User details fetched', { user,
            additionalInfo: {
                reviewCount,
                businesses,
                reportCount
            }
        });

    } catch (error) {
        return responseHandler.error(res, 'Failed to fetch user details', 500);
    }
};




