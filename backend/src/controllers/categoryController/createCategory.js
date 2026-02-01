import Joi from 'joi';
import { Category } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().required(),
            description: Joi.string().max(500).optional(),
            icon: Joi.string().uri().optional(),
            parentCategory: Joi.string().optional().allow(null),
            level: Joi.number().min(0).max(2).optional(),
            order: Joi.number().min(0).optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const { name, description, icon, parentCategory, level, order } = req.body;

            // Check if category already exists
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return responseHandler.conflict(res, 'Category with this name already exists');
            }

            const category = new Category({
                name,
                description,
                icon,
                parentCategory: parentCategory || null,
                level: level !== undefined ? level : 0,
                order: order || 0
            });

            await category.save();

            return responseHandler.success(res, 'Category created successfully', category, 201);

        } catch (error) {
            console.error('Create category error:', error);
            return responseHandler.error(res, error?.message || 'Failed to create category');
        }
    }
};


