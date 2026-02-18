import { Business, Item, Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const {
            page = 1,
            limit = 0, // Default 0 = no limit (fetch ALL businesses)
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

        // If limit is specified and not 0, apply pagination
        const shouldPaginate = limit && parseInt(limit) > 0;
        const skip = shouldPaginate ? (parseInt(page) - 1) * parseInt(limit) : 0;

        let query = Business.find(filter)
            .sort(sort)
            .populate('owner', 'username profile.firstName profile.lastName profile.avatar')
            .select('-__v');

        // Only apply pagination if limit is specified
        if (shouldPaginate) {
            query = query.skip(skip).limit(parseInt(limit));
        }

        const [businesses, total] = await Promise.all([
            query,
            Business.countDocuments(filter)
        ]);

        // Optimize: Fetch all data in bulk instead of per-business
        const businessIds = businesses.map(b => b._id);
        
        // Fetch all reviews and items in parallel with single queries
        const [allBusinessReviews, allItems] = await Promise.all([
            Review.find({ 
                businessId: { $in: businessIds },
                reviewType: 'business',
                isActive: true 
            }).select('businessId rating'),
            Item.find({ businessId: { $in: businessIds } }).select('businessId')
        ]);
        
        // Get all item reviews in one query
        const itemIds = allItems.map(item => item._id);
        const allItemReviews = itemIds.length > 0 ? await Review.find({
            itemId: { $in: itemIds },
            isActive: true
        }).select('itemId rating') : [];
        
        // Group data by business for fast lookup
        const reviewsByBusiness = {};
        const itemsByBusiness = {};
        const reviewsByItem = {};
        
        allBusinessReviews.forEach(review => {
            const bid = review.businessId.toString();
            if (!reviewsByBusiness[bid]) reviewsByBusiness[bid] = [];
            reviewsByBusiness[bid].push(review);
        });
        
        allItems.forEach(item => {
            const bid = item.businessId.toString();
            if (!itemsByBusiness[bid]) itemsByBusiness[bid] = [];
            itemsByBusiness[bid].push(item);
        });
        
        allItemReviews.forEach(review => {
            const iid = review.itemId.toString();
            if (!reviewsByItem[iid]) reviewsByItem[iid] = [];
            reviewsByItem[iid].push(review);
        });
        
        // Calculate stats for each business using grouped data
        const businessesWithStats = businesses.map(business => {
            const businessObj = business.toObject();
            const bid = business._id.toString();
            
            // Get reviews for this business
            const businessReviews = reviewsByBusiness[bid] || [];
            const items = itemsByBusiness[bid] || [];
            
            // Collect all ratings
            const allRatings = [];
            businessReviews.forEach(review => {
                if (review.rating) allRatings.push(review.rating);
            });
            
            // Add item reviews
            items.forEach(item => {
                const itemReviews = reviewsByItem[item._id.toString()] || [];
                itemReviews.forEach(review => {
                    if (review.rating) allRatings.push(review.rating);
                });
            });
            
            // Calculate merged statistics
            const totalReviews = allRatings.length;
            const averageRating = totalReviews > 0 
                ? allRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews 
                : 0;
            
            // Update business object
            businessObj.stats.totalReviews = totalReviews;
            businessObj.stats.totalItems = items.length;
            businessObj.rating = averageRating;
            businessObj.averageRating = averageRating;
            businessObj.reviewCount = totalReviews;
            businessObj.itemsCount = items.length;
            
            return businessObj;
        });

        return responseHandler.success(
            res,
            'Businesses retrieved successfully',
            {
                businesses: businessesWithStats,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: shouldPaginate ? Math.ceil(total / parseInt(limit)) : 1
                }
            }
        );

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve businesses');
    }
    }
};


