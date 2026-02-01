import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            category,
            type,
            city,
            sortBy = 'createdAt',
            order = 'desc',
            minRating,
            isClaimed,
            isVerified,
            owner
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            filter.category = category;
        }

        if (type) {
            filter.type = type;
        }

        if (city) {
            filter['location.city'] = new RegExp(city, 'i');
        }

        if (minRating) {
            filter['stats.avgRating'] = { $gte: parseFloat(minRating) };
        }

        if (isClaimed !== undefined) {
            filter.isClaimed = isClaimed === 'true';
        }

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        if (owner) {
            filter.owner = owner;
        }

        // Build sort object
        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        // If text search, sort by text score
        if (search) {
            sort.score = { $meta: 'textScore' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [businesses, total] = await Promise.all([
            Business.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('owner', 'username profile.firstName profile.lastName profile.avatar')
                .select('-__v'),
            Business.countDocuments(filter)
        ]);

        return responseHandler.success(
            res,
            'Businesses retrieved successfully',
            {
                businesses,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        );

    } catch (error) {
        console.error('List businesses error:', error);
        return responseHandler.error(res, error?.message || 'Failed to retrieve businesses');
    }
    }
};


