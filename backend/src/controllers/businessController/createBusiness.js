import Joi from 'joi';
import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    // Only validate flat scalar fields here; location/contact are extracted manually
    // to support both JSON body and multipart FormData (bracket-notation keys)
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().max(200).required(),
            type: Joi.string().trim().max(100).required(),
            category: Joi.string().trim().max(100).allow('').optional(),
            subcategory: Joi.string().trim().optional(),
            description: Joi.string().max(2000).optional()
        }).options({ allowUnknown: true })
    }),
    handler: async (req, res) => {
        try {
            const { name, type, subcategory, description } = req.body;
            const category = req.body.category || type;

            // Extract location — supports both JSON nested object and FormData bracket notation
            const loc = (req.body.location && typeof req.body.location === 'object')
                ? req.body.location
                : {
                    address:  req.body['location[address]'],
                    city:     req.body['location[city]'],
                    state:    req.body['location[state]'],
                    country:  req.body['location[country]'] || 'India',
                    pincode:  req.body['location[pincode]'],
                    coordinates: {
                        coordinates: [
                            parseFloat(req.body['location[coordinates][coordinates][0]']) || 0,
                            parseFloat(req.body['location[coordinates][coordinates][1]']) || 0
                        ]
                    }
                };

            if (!loc.address || !loc.city || !loc.state) {
                return responseHandler.error(res, 'Address, city and state are required', 400);
            }

            // Extract contact — same dual-format support
            const contact = (req.body.contact && typeof req.body.contact === 'object')
                ? req.body.contact
                : {
                    phone:    req.body['contact[phone]']    || '',
                    whatsapp: req.body['contact[whatsapp]'] || '',
                    email:    req.body['contact[email]']    || '',
                    website:  req.body['contact[website]']  || ''
                };

            // Handle uploaded images from uploadBusinessImages() middleware
            const logoUrl = req.uploadedFile?.url || null;
            const coverImageUrls = req.uploadedFiles?.map(f => f.url) || [];

            const defaultBusinessHours = [
                { day: 'monday',    open: '09:00', close: '18:00', isClosed: false },
                { day: 'tuesday',   open: '09:00', close: '18:00', isClosed: false },
                { day: 'wednesday', open: '09:00', close: '18:00', isClosed: false },
                { day: 'thursday',  open: '09:00', close: '18:00', isClosed: false },
                { day: 'friday',    open: '09:00', close: '18:00', isClosed: false },
                { day: 'saturday',  open: '09:00', close: '18:00', isClosed: false },
                { day: 'sunday',    open: '09:00', close: '18:00', isClosed: true  }
            ];

            const business = new Business({
                name,
                type,
                category,
                subcategory,
                description,
                logo: logoUrl,
                coverImages: coverImageUrls,
                location: {
                    address: loc.address,
                    city:    loc.city,
                    state:   loc.state,
                    country: loc.country || 'India',
                    pincode: loc.pincode,
                    coordinates: {
                        type: 'Point',
                        coordinates: loc.coordinates?.coordinates || [0, 0]
                    }
                },
                contact,
                businessHours: defaultBusinessHours,
                owner: req.user.id,
                createdBy: req.user.id,
                isClaimed: true,
                isVerified: false
            });

            await business.save();

            return responseHandler.success(res, 'Business created successfully', business, 201);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to create business');
        }
    }
};


