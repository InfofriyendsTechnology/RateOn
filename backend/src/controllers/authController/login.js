import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin, User, Business } from "../../models/index.js";
import validator from "../../utils/validator.js";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            login: Joi.string().required(),
            password: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { login, password } = req.body;

            let foundUser = await Admin.findOne({
                $or: [{ email: login }, { username: login }, { phone: login }]
            });

            let userType = 'admin';

            if (!foundUser) {
                foundUser = await User.findOne({
                    $or: [{ email: login }, { username: login }]
                });
                userType = 'user';
            }

            if (!foundUser) {
                return responseHandler.error(res, "Account not found");
            }

            if (!foundUser.isActive) {
                return responseHandler.error(res, "Your account has been deactivated. Please contact support.");
            }

            const isValidPassword = userType === 'user' 
                ? await foundUser.comparePassword(password)
                : await bcrypt.compare(password, foundUser.password);

            if (!isValidPassword) {
                return responseHandler.error(res, "Invalid password");
            }

            foundUser.isLoggedIn = true;
            await foundUser.save();

            const tokenPayload = {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                userType,
                role: foundUser.role,
            };

            if (userType === 'admin') {
                tokenPayload.roleName = foundUser.role;
            }

            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

            const userResponse = foundUser.toObject();
            delete userResponse.password;
            
            // If business owner, fetch their business
            if (userType === 'user' && foundUser.role === 'business_owner') {
                const business = await Business.findOne({ owner: foundUser._id });
                if (business) {
                    userResponse.business = {
                        _id: business._id,
                        name: business.name,
                        type: business.type,
                        category: business.category
                    };
                }
            }

            return responseHandler.success(res, "Login successful", { 
                token, 
                user: userResponse,
                userType 
            });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}


