import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from "../../models/AdminModel.js";
import validator from "../../utils/validator.js";
import { JWT_SECRET } from "../../config/config.js";
import responseHandler from "../../utils/responseHandler.js";

/**
 * Validates dynamic password: current date (DMMYYYY or DDMMYYYY or DMMYYYY or DDMYYYY) + 9325
 * Example: For 3/2/2026, password is "322269325" (no zero padding)
 * Example: For 25/12/2026, password is "251220269325"
 */
function validateDynamicPassword(password) {
    // Check if all characters are digits
    if (!password || !/^\d+$/.test(password)) return false;
    
    // Check if ends with 9325
    if (!password.endsWith('9325')) return false;
    
    // Get current date (no zero padding)
    const today = new Date();
    const dd = today.getDate(); // 1-31
    const mm = today.getMonth() + 1; // 1-12
    const yyyy = today.getFullYear(); // 2026
    const expectedPassword = `${dd}${mm}${yyyy}9325`;
    
    // Compare passwords
    return password === expectedPassword;
}

export default {
    validator: validator({
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate email is admin email
            if (email.toLowerCase() !== 'admin@rateon.com') {
                return responseHandler.error(res, "Invalid credentials");
            }

            // Dynamic password: DDMMYYYY + 9325
            const isValidPassword = validateDynamicPassword(password);
            if (!isValidPassword) {
                return responseHandler.error(res, "Invalid credentials");
            }

            // Create admin token without database lookup
            const token = jwt.sign({
                id: 'super-admin',
                username: 'Super Admin',
                email: 'admin@rateon.com',
                role: 'super_admin',
                userType: 'admin'
            }, JWT_SECRET, { expiresIn: '7d' });

            const adminResponse = {
                _id: 'super-admin',
                username: 'Super Admin',
                email: 'admin@rateon.com',
                role: 'super_admin',
                isActive: true
            };

            return responseHandler.success(res, "Admin login successful", { 
                token, 
                admin: adminResponse,
                userType: 'admin'
            });

        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}
