import { User, Business, Item, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create dummy data by running seed script
 */
export const createDummyData = {
    handler: async (req, res) => {
        try {
            const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'seedDummyData.js');
            
            // Run seed script with environment variables
            const env = process.env;
            const { stdout } = await execPromise(
                `node "${scriptPath}"`,
                { env, maxBuffer: 1024 * 1024 * 10 } // 10MB buffer for large output
            );
            
            return responseHandler.success(
                res,
                'Dummy data created successfully',
                {
                    output: stdout,
                    message: 'Created 100 business owners with businesses and items'
                }
            );
        } catch (error) {
            const errorMessage = error.stderr || error.stdout || error.message || 'Failed to create dummy data';
            return responseHandler.error(
                res,
                errorMessage
            );
        }
    }
};

/**
 * Clear all dummy data
 */
export const clearDummyData = {
    handler: async (req, res) => {
        try {
            // Find all dummy users with @business.com emails
            const dummyUsers = await User.find({ 
                email: { $regex: '@business\.com$' }
            }).select('_id');
            
            const dummyUserIds = dummyUsers.map(u => u._id);
            
            if (dummyUserIds.length === 0) {
                return responseHandler.success(
                    res,
                    'No dummy data found',
                    { deletedCount: 0 }
                );
            }
            
            // Delete all related data
            const businesses = await Business.deleteMany({ 
                owner: { $in: dummyUserIds } 
            });
            
            const items = await Item.deleteMany({ 
                createdBy: { $in: dummyUserIds } 
            });
            
            const reviews = await Review.deleteMany({ 
                userId: { $in: dummyUserIds } 
            });
            
            const users = await User.deleteMany({ 
                _id: { $in: dummyUserIds } 
            });
            
            return responseHandler.success(
                res,
                'Dummy data cleared successfully',
                {
                    deletedUsers: users.deletedCount,
                    deletedBusinesses: businesses.deletedCount,
                    deletedItems: items.deletedCount,
                    deletedReviews: reviews.deletedCount
                }
            );
        } catch (error) {
            return responseHandler.error(
                res,
                error.message || 'Failed to clear dummy data'
            );
        }
    }
};

/**
 * Get all dummy business accounts
 */
export const getDummyAccounts = {
    handler: async (req, res) => {
        try {
            const dummyUsers = await User.find({ 
                email: { $regex: '@business\.com$' },
                role: 'business_owner'
            })
            .select('_id username email name profile.city profile.state')
            .sort({ username: 1 })
            .limit(100);
            
            // Get business count for each owner
            const usersWithBusinessCount = await Promise.all(
                dummyUsers.map(async (user) => {
                    const businessCount = await Business.countDocuments({ 
                        owner: user._id 
                    });
                    
                    return {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        name: user.name || user.username,
                        location: user.profile?.city ? `${user.profile.city}, ${user.profile.state}` : 'India',
                        businessCount
                    };
                })
            );
            
            return responseHandler.success(
                res,
                'Dummy accounts fetched successfully',
                {
                    accounts: usersWithBusinessCount,
                    total: usersWithBusinessCount.length
                }
            );
        } catch (error) {
            return responseHandler.error(
                res,
                error.message || 'Failed to fetch dummy accounts'
            );
        }
    }
};

/**
 * Get impersonation token for dummy business account
 * Allows admin to login as any dummy business owner
 */
export const impersonateBusinessOwner = {
    handler: async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Find the user
            const user = await User.findById(userId);
            
            if (!user) {
                return responseHandler.notFound(res, 'User not found');
            }
            
            // Only allow impersonation of dummy accounts
            if (!user.email.endsWith('@business.com')) {
                return responseHandler.forbidden(
                    res,
                    'Can only impersonate dummy business accounts'
                );
            }
            
            // Generate JWT token
            const jwt = require('jsonwebtoken');
            const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/config.js');
            
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
                { expiresIn: JWT_EXPIRES_IN }
            );
            
            return responseHandler.success(
                res,
                'Impersonation token generated',
                {
                    token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        profile: user.profile
                    }
                }
            );
        } catch (error) {
            return responseHandler.error(
                res,
                error.message || 'Failed to impersonate user'
            );
        }
    }
};

/**
 * Get seed data statistics
 */
export const getSeedStats = {
    handler: async (req, res) => {
        try {
            const dummyUsers = await User.find({ 
                email: { $regex: '@business\.com$' }
            }).select('_id');
            
            const dummyUserIds = dummyUsers.map(u => u._id);
            
            const [businessCount, itemCount, reviewCount] = await Promise.all([
                Business.countDocuments({ owner: { $in: dummyUserIds } }),
                Item.countDocuments({ createdBy: { $in: dummyUserIds } }),
                Review.countDocuments({ userId: { $in: dummyUserIds } })
            ]);
            
            return responseHandler.success(
                res,
                'Seed statistics fetched successfully',
                {
                    dummyUsers: dummyUsers.length,
                    businesses: businessCount,
                    items: itemCount,
                    reviews: reviewCount,
                    hasDummyData: dummyUsers.length > 0
                }
            );
        } catch (error) {
            return responseHandler.error(
                res,
                error.message || 'Failed to fetch seed statistics'
            );
        }
    }
};
