import Joi from 'joi';
import { Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        body: Joi.object({
            status: Joi.string().valid('available', 'out_of_stock', 'coming_soon').required(),
            availableUntil: Joi.date().optional().allow(null),
            note: Joi.string().max(200).optional().allow('')
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;
        const { status, availableUntil, note } = req.body;

        if (!status) {
            return responseHandler.error(res, 'Status is required');
        }

        const item = await Item.findById(id);
        if (!item) {
            return responseHandler.notFound(res, 'Item not found');
        }

        // Check authorization
        const business = await Business.findById(item.businessId);
        const isOwner = business.owner && business.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return responseHandler.forbidden(
                res,
                'Unauthorized: Only business owner can update availability'
            );
        }

        // Update availability
        item.availability.status = status;
        if (availableUntil !== undefined) {
            item.availability.availableUntil = availableUntil;
        }
        if (note !== undefined) {
            item.availability.note = note;
        }

        await item.save();

        return responseHandler.success(res, 'Item availability updated successfully', item);

    } catch (error) {
        console.error('Update availability error:', error);
        return responseHandler.error(res, error?.message || 'Failed to update availability');
    }
    }
};


