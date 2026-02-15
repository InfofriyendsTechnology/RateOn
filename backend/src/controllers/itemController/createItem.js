import Joi from 'joi';
import { Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { logActivity } from '../../utils/activityTracker.js';

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().max(200).required(),
            description: Joi.string().max(1000).optional(),
            price: Joi.number().min(0).required(),
            images: Joi.array().items(Joi.string().uri()).optional(),
            category: Joi.string().trim().required(),
            availability: Joi.object({
                status: Joi.string().valid('available', 'out_of_stock', 'coming_soon').optional(),
                availableUntil: Joi.date().optional(),
                note: Joi.string().max(200).optional()
            }).optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { businessId } = req.params;
        const {
            name,
            description,
            price,
            category,
            availability
        } = req.body;

        // Get uploaded image URLs from middleware
        const images = req.uploadedFiles ? req.uploadedFiles.map(f => f.url) : [];

        // Validate required fields
            if (!name || price === undefined || !category) {
            return responseHandler.error(
                res,
                'Missing required fields: name, price, category'
            );
        }

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

        // Check if user is the business owner or admin
        const isOwner = business.owner && business.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return responseHandler.forbidden(
                res,
                'Unauthorized: Only business owner can add items'
            );
        }

        // Create item
        const item = new Item({
            businessId,
            name,
            description,
            price,
            images: images || [],
            category,
            availability: availability || {
                status: 'available'
            },
            createdBy: req.user.id
        });

        await item.save();

        // Update business stats
        business.stats.totalItems += 1;
        await business.save();

        // Log activity for trust score (only for business owner, not admin)
        if (isOwner) {
            await logActivity(
                req.user.id,
                'item_added',
                { type: 'Item', id: item._id },
                { itemName: name, businessId, category }
            );
        }

        return responseHandler.success(res, 'Item created successfully', item, 201);

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to create item');
    }
    }
};


