import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { User, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { JWT_SECRET } from '../../config/config.js';

export default {
    validator: validator({
        body: Joi.object({
            // Owner details
            username: Joi.string().trim().lowercase().min(3).max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            firstName: Joi.string().trim().max(50).required(),
            lastName: Joi.string().trim().max(50).optional(),
            phoneNumber: Joi.string().optional(),
            
            // Business details
            businessName: Joi.string().trim().max(200).required(),
            businessType: Joi.string().valid('restaurant', 'cafe', 'shop', 'service', 'other').required(),
            category: Joi.string().trim().required(),
            subcategory: Joi.string().trim().optional(),
            description: Joi.string().max(2000).optional(),
            
            // Business location
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().optional().default('India'),
            pincode: Joi.string().optional(),
            coordinates: Joi.object({
                lng: Joi.number().required(),
                lat: Joi.number().required()
            }).required(),
            
            // Business contact
            businessPhone: Joi.string().optional(),
            businessWhatsapp: Joi.string().optional(),
            businessEmail: Joi.string().email().optional(),
            businessWebsite: Joi.string().uri().optional()
        })
    }),
    
    handler: async (req, res) => {
        try {
            const {
                username,
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                businessName,
                businessType,
                category,
                subcategory,
                description,
                address,
                city,
                state,
                country,
                pincode,
                coordinates,
                businessPhone,
                businessWhatsapp,
                businessEmail,
                businessWebsite
            } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                const message = existingUser.email === email
                    ? 'This email is already registered. Please use a different email or login to your existing account.'
                    : 'Username already taken. Please choose a different username.';
                return responseHandler.conflict(res, message);
            }

            // Check if business name already exists in that city
            const existingBusiness = await Business.findOne({
                name: businessName,
                'location.city': city
            });

            if (existingBusiness) {
                return responseHandler.conflict(
                    res,
                    'A business with this name already exists in this city'
                );
            }

            // Create business owner user
            const user = new User({
                username,
                email,
                password,
                phoneNumber,
                role: 'business_owner',
                profile: {
                    firstName,
                    lastName: lastName || ''
                },
                isEmailVerified: false
            });

            await user.save();

            // Create business and associate with owner
            const business = new Business({
                name: businessName,
                type: businessType,
                category,
                subcategory,
                description,
                location: {
                    address,
                    city,
                    state,
                    country: country || 'India',
                    pincode,
                    coordinates: {
                        type: 'Point',
                        coordinates: [coordinates.lng, coordinates.lat]
                    }
                },
                contact: {
                    phone: businessPhone,
                    whatsapp: businessWhatsapp,
                    email: businessEmail || email,
                    website: businessWebsite
                },
                owner: user._id,
                createdBy: user._id,
                isClaimed: true,
                isVerified: false
            });

            await business.save();

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    userType: 'user'
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Update user login status
            user.isLoggedIn = true;
            await user.save();

            // Return user info and token
            const userResponse = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                business: {
                    id: business._id,
                    name: business.name,
                    type: business.type
                },
                token
            };

            return responseHandler.success(
                res,
                'Business owner account created successfully',
                userResponse,
                201
            );

        } catch (error) {
            console.error('Business registration error:', error);
            return responseHandler.error(res, error?.message || 'Failed to register business owner');
        }
    }
};


