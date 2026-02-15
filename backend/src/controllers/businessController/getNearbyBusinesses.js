import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const {
            lng,
            lat,
            maxDistance = 5000, // in meters (default 5km)
            category,
            type,
            minRating,
            limit = 20
        } = req.query;

        if (!lng || !lat) {
            return responseHandler.error(
                res,
                'Longitude and latitude are required'
            );
        }

        const filter = {
            isActive: true,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        };

        if (category) {
            filter.category = category;
        }

        if (type) {
            filter.type = type;
        }

        if (minRating) {
            filter['stats.avgRating'] = { $gte: parseFloat(minRating) };
        }

        const businesses = await Business.find(filter)
            .limit(parseInt(limit))
            .populate('owner', 'username profile.firstName profile.lastName profile.avatar')
            .select('-__v');

        // Calculate distance for each business
        const businessesWithDistance = businesses.map(business => {
            const [businessLng, businessLat] = business.location.coordinates.coordinates;
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                businessLat,
                businessLng
            );
            return {
                ...business.toObject(),
                distance: Math.round(distance * 100) / 100 // Round to 2 decimals
            };
        });

        return responseHandler.success(
            res,
            'Nearby businesses retrieved successfully',
            {
                businesses: businessesWithDistance,
                count: businessesWithDistance.length
            }
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve nearby businesses');
    }
    }
};

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}


