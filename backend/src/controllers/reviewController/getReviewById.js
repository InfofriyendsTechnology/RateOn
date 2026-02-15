import Joi from 'joi';
import { Review } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findOne({ _id: id, isActive: true })
            .populate('userId', 'username profile.firstName profile.lastName profile.avatar trustScore level')
            .populate('itemId', 'name images price')
            .populate('businessId', 'name location.address location.city')
            .populate('ownerResponse.respondedBy', 'username profile.firstName profile.lastName')
            .lean();

        if (!review) {
            return responseHandler.notFound(res, 'Review not found');
        }

        return responseHandler.success(res, 'Review retrieved successfully', review);

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to retrieve review');
    }
    }
};


