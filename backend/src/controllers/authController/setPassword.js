import Joi from "joi";
import { User } from "../../models/index.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            password: Joi.string()
                .min(6)
                .required()
                .messages({
                    'string.min': 'Password must be at least 6 characters'
                }),
            confirmPassword: Joi.string()
                .valid(Joi.ref('password'))
                .required()
                .messages({
                    'any.only': 'Passwords do not match'
                })
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;

            // Fetch fresh user (middleware strips password via select('-password'))
            const user = await User.findById(userId);

            if (!user) {
                return responseHandler.error(res, 'User not found', 404);
            }

            // Only allowed for Google-only accounts that have no password yet
            if (user.password) {
                return responseHandler.error(
                    res,
                    'Password is already set. Use change-password to update it.'
                );
            }

            user.password = req.body.password;
            await user.save();

            return responseHandler.success(res, 'Password created successfully');

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to set password');
        }
    }
};
