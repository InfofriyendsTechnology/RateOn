import { Category } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';

export default {
    handler: async (req, res) => {
        try {
            const { level, parentCategory } = req.query;

            const filter = { isActive: true };

            if (level !== undefined) {
                filter.level = parseInt(level);
            }

            if (parentCategory) {
                filter.parentCategory = parentCategory;
            }

            const categories = await Category.find(filter)
                .sort({ order: 1, name: 1 })
                .populate('parentCategory', 'name slug')
                .select('-__v');

            return responseHandler.success(res, 'Categories retrieved successfully', categories);

        } catch (error) {
            console.error('Get categories error:', error);
            return responseHandler.error(res, error?.message || 'Failed to retrieve categories');
        }
    }
};


