import Joi from "joi";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from "../../models/index.js";
import validator from "../../utils/validator.js";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            username: Joi.string()
                .min(3)
                .max(30)
                .pattern(/^[a-zA-Z0-9_]+$/)
                .required()
                .messages({
                    'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                    'string.min': 'Username must be at least 3 characters long',
                    'string.max': 'Username cannot exceed 30 characters'
                }),
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': 'Please provide a valid email address'
                }),
            password: Joi.string()
                .min(6)
                .required()
                .messages({
                    'string.min': 'Password must be at least 6 characters long'
                }),
            firstName: Joi.string()
                .trim()
                .optional()
                .allow(''),
            lastName: Joi.string()
                .trim()
                .optional()
                .allow('')
        })
    }),
    handler: async (req, res) => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            const existingUsername = await User.findOne({ username: username.toLowerCase() });
            if (existingUsername) {
                return responseHandler.error(res, "Username is already taken");
            }

            const existingEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingEmail) {
                return responseHandler.error(res, "Email is already registered");
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const newUser = await User.create({
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password,
                profile: {
                    firstName: firstName || '',
                    lastName: lastName || ''
                },
                verificationToken,
                verificationTokenExpiry
            });

            const token = jwt.sign({
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                userType: 'user'
            }, JWT_SECRET, { expiresIn: '30d' });

            const userResponse = newUser.toObject();
            delete userResponse.password;
            delete userResponse.verificationToken;

            const verificationLink = `http://localhost:1126/api/v1/auth/verify-email?token=${verificationToken}`;

            return responseHandler.success(
                res, 
                "Account created successfully. Please check your email to verify your account.", 
                { 
                    token, 
                    user: userResponse,
                    verificationLink,
                    message: "Email verification required to increase trust score"
                },
                201
            );

        } catch (error) {
            return responseHandler.error(res, error?.message || "Registration failed");
        }
    }
}


