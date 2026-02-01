import { Item, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const { businessId } = req.params;
        const {
            page = 1,
            limit = 50,
            category,
            minRating,
            maxPrice,
            availability,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build filter
        const filter = {
            businessId,
            isActive: true
        };

        if (category) {
            filter.category = category;
        }

        if (minRating) {
            filter['stats.averageRating'] = { $gte: parseFloat(minRating) };
        }

        if (maxPrice) {
            filter.price = { $lte: parseFloat(maxPrice) };
        }

        if (availability) {
            filter['availability.status'] = availability;
        }

        // Build sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            Item.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v'),
            Item.countDocuments(filter)
        ]);
        
        // Check if user has reviewed each item
        if (req.user?.id) {
            const itemIds = items.map(item => item._id);
            const userReviews = await Review.find({
                userId: req.user.id,
                itemId: { $in: itemIds }
            }).select('itemId _id');
            
            const reviewMap = new Map(userReviews.map(r => [r.itemId.toString(), r._id]));
            
            items.forEach(item => {
                item._doc.userReviewId = reviewMap.get(item._id.toString()) || null;
                item._doc.hasUserReview = reviewMap.has(item._id.toString());
            });
        }

        return responseHandler.success(
            res,
            'Items retrieved successfully',
            {
                items,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        );

    } catch (error) {
        console.error('Get items by business error:', error);
        return responseHandler.error(res, error?.message || 'Failed to retrieve items');
    }
    }
};


