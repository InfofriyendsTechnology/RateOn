import { Item, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const {
            search,
            category,
            minRating,
            maxPrice,
            minPrice,
            availability,
            page = 1,
            limit = 20,
            sortBy = 'stats.averageRating',
            order = 'desc'
        } = req.query;

        const filter = { isActive: true };

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            filter.category = category;
        }

        if (minRating) {
            filter['stats.averageRating'] = { $gte: parseFloat(minRating) };
        }

        if (maxPrice || minPrice) {
            filter.price = {};
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
        }

        if (availability) {
            filter['availability.status'] = availability;
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        if (search) {
            sort.score = { $meta: 'textScore' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            Item.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate({
                    path: 'businessId',
                    select: 'name location.city location.address'
                })
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
            'Items search completed successfully',
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
        console.error('Search items error:', error);
        return responseHandler.error(res, error?.message || 'Failed to search items');
    }
    }
};


