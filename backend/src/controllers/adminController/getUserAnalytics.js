import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Total users
            const totalUsers = await User.countDocuments();
            const totalRegularUsers = await User.countDocuments({ role: 'user' });
            const totalBusinessOwners = await User.countDocuments({ role: 'business_owner' });

            // Google accounts vs normal email
            const googleAccounts = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
            const emailPasswordAccounts = await User.countDocuments({ 
                $or: [
                    { googleId: { $exists: false } },
                    { googleId: null }
                ],
                password: { $exists: true, $ne: null }
            });

            // Gmail vs other emails
            const gmailUsers = await User.countDocuments({ 
                email: { $regex: /@gmail\.com$/i }
            });
            const otherEmailUsers = totalUsers - gmailUsers;

            // Active vs inactive
            const activeUsers = await User.countDocuments({ isActive: true });
            const inactiveUsers = await User.countDocuments({ isActive: false });

            // Email/Phone verified
            const emailVerified = await User.countDocuments({ isEmailVerified: true });
            const phoneVerified = await User.countDocuments({ isPhoneVerified: true });

            // Recent signups (last 7, 30 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            const newUsersLast7Days = await User.countDocuments({ 
                createdAt: { $gte: sevenDaysAgo }
            });
            const newUsersLast30Days = await User.countDocuments({ 
                createdAt: { $gte: thirtyDaysAgo }
            });

            return responseHandler.success(res, 'User analytics fetched', {
                total: {
                    allUsers: totalUsers,
                    regularUsers: totalRegularUsers,
                    businessOwners: totalBusinessOwners
                },
                authMethod: {
                    googleAccounts,
                    emailPasswordAccounts
                },
                emailProviders: {
                    gmail: gmailUsers,
                    other: otherEmailUsers
                },
                status: {
                    active: activeUsers,
                    inactive: inactiveUsers
                },
                verification: {
                    emailVerified,
                    phoneVerified
                },
                growth: {
                    last7Days: newUsersLast7Days,
                    last30Days: newUsersLast30Days
                }
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch user analytics', 500);
        }
    }
}
