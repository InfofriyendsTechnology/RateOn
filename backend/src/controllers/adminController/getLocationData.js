import { User } from "../../models/index.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    handler: async (req, res) => {
        try {
            // Get users with location data (coordinates must exist and not be default [0,0])
            const usersWithLocation = await User.find({
                'profile.coordinates.coordinates': { 
                    $exists: true,
                    $ne: [0, 0]
                },
                'profile.country': { 
                    $exists: true, 
                    $ne: '' 
                }
            })
            .select('_id username profile.coordinates profile.city profile.country profile.state')
            .limit(1000) // Limit to 1000 users for performance
            .lean();

            // Transform data for map visualization
            const locationData = usersWithLocation.map(user => ({
                userId: user._id,
                username: user.username,
                coordinates: {
                    type: 'Point',
                    coordinates: user.profile.coordinates.coordinates // [longitude, latitude]
                },
                city: user.profile.city || 'Unknown',
                state: user.profile.state || '',
                country: user.profile.country
            }));

            // Get location summary statistics
            const locationSummary = await User.aggregate([
                {
                    $match: {
                        'profile.country': { $exists: true, $ne: '' }
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
                    $limit: 10
                },
                {
                    $project: {
                        country: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return responseHandler.success(res, 'Location data fetched successfully', {
                totalLocations: locationData.length,
                locations: locationData,
                topCountries: locationSummary
            });

        } catch (error) {
            return responseHandler.error(res, 'Failed to fetch location data', 500);
        }
    }
}
