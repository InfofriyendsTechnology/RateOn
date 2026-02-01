import { Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Item.findById(id)
            .populate({
                path: 'businessId',
                select: 'name type category location contact'
            });

        if (!item) {
            return responseHandler.notFound(res, 'Item not found');
        }

        // Increment view count
        item.stats.views += 1;
        await item.save();

        return responseHandler.success(res, 'Item retrieved successfully', item);

    } catch (error) {
        console.error('Get item error:', error);
        return responseHandler.error(res, error?.message || 'Failed to retrieve item');
    }
    }
};


