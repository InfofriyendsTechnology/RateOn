import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Total users count
            const totalUsers = await User.countDocuments();

            // User statistics by registration method
            const byRegistrationMethod = await User.aggregate([
                {
                    $group: {
                        _id: "$registrationMethod",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const registrationMethodStats = {
                email: 0,
                google: 0,
                facebook: 0,
                phone: 0
            };
            byRegistrationMethod.forEach(item => {
                if (item._id) {
                    registrationMethodStats[item._id] = item.count;
                }
            });

            // User statistics by gender
            const byGender = await User.aggregate([
                {
                    $group: {
                        _id: "$gender",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const genderStats = {
                male: 0,
                female: 0,
                other: 0,
                prefer_not_to_say: 0
            };
            byGender.forEach(item => {
                if (item._id) {
                    genderStats[item._id] = item.count;
                }
            });

            // User statistics by country (top 20 countries)
            const byCountry = await User.aggregate([
                {
                    $match: {
                        "profile.country": { $exists: true, $ne: "" }
                    }
                },
                {
                    $group: {
                        _id: "$profile.country",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 20
                },
                {
                    $project: {
                        country: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return responseHandler.success(res, 'User statistics fetched successfully', {
                totalUsers,
                byRegistrationMethod: registrationMethodStats,
                byGender: genderStats,
                byCountry
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch user statistics', 500);
        }
    }
}
