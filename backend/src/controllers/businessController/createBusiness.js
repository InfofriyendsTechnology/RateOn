import Joi from 'joi';
import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().max(200).required(),
            type: Joi.string().valid('restaurant', 'cafe', 'shop', 'service', 'other').required(),
            category: Joi.string().trim().required(),
            subcategory: Joi.string().trim().optional(),
            description: Joi.string().max(2000).optional(),
            coverImages: Joi.array().items(Joi.string().uri()).optional(),
            location: Joi.object({
                address: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                country: Joi.string().optional().default('India'),
                pincode: Joi.string().optional(),
                coordinates: Joi.object({
                    coordinates: Joi.array().items(Joi.number()).length(2).required()
                }).required()
            }).required(),
            contact: Joi.object({
                phone: Joi.string().optional(),
                whatsapp: Joi.string().optional(),
                email: Joi.string().email().optional(),
                website: Joi.string().uri().optional()
            }).optional(),
            businessHours: Joi.array().items(
                Joi.object({
                    day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
                    open: Joi.string().required(),
                    close: Joi.string().required(),
                    isClosed: Joi.boolean().optional()
                })
            ).optional(),
            menuPDF: Joi.string().uri().optional()
        })
    }),
    handler: async (req, res) => {
        try {
            const {
                name,
                type,
                category,
                subcategory,
                description,
                coverImages,
                location,
                contact,
                businessHours,
                menuPDF
            } = req.body;

            // Default business hours if not provided (Mon-Sat: 9 AM - 6 PM, Sunday closed)
            const defaultBusinessHours = [
                { day: 'monday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'tuesday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'wednesday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'thursday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'friday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'saturday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'sunday', open: '09:00', close: '18:00', isClosed: true }
            ];

            const business = new Business({
                name,
                type,
                category,
                subcategory,
                description,
                coverImages: coverImages || [],
                location: {
                    address: location.address,
                    city: location.city,
                    state: location.state,
                    country: location.country || 'India',
                    pincode: location.pincode,
                    coordinates: {
                        type: 'Point',
                        coordinates: location.coordinates.coordinates
                    }
                },
                contact: contact || {},
                businessHours: businessHours || defaultBusinessHours,
                menuPDF,
                owner: req.user.id,  // Set owner for business_owner role
                createdBy: req.user.id,
                isClaimed: true,  // Auto-claimed when created by business owner
                isVerified: false
            });

            await business.save();

            return responseHandler.success(res, 'Business created successfully', business, 201);

        } catch (error) {
            console.error('Create business error:', error);
            return responseHandler.error(res, error?.message || 'Failed to create business');
        }
    }
};


