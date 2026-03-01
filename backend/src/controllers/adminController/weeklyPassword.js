import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Admin from '../../models/AdminModel.js';
import responseHandler from '../../utils/responseHandler.js';

const ADMIN_EMAIL = 'admin@rateon.com';
const EXPIRY_DAYS = 7;

/** Generate a random strong password: 8 alphanumeric chars */
function generatePassword() {
    return crypto.randomBytes(6).toString('base64url').slice(0, 10);
}

/** POST /api/admin/settings/weekly-password
 *  Body (optional): { password: "custom" }
 *  If no body, auto-generates a random one.
 *  Returns the plain-text password (only time it's visible).
 */
export const setWeeklyPassword = {
    handler: async (req, res) => {
        try {
            const plainPassword = req.body?.password?.trim() || generatePassword();

            if (plainPassword.length < 6) {
                return responseHandler.error(res, 'Password must be at least 6 characters');
            }

            const hashed = await bcrypt.hash(plainPassword, 10);
            const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

            // Upsert the admin doc (may not exist since login bypasses DB)
            await Admin.findOneAndUpdate(
                { email: ADMIN_EMAIL },
                {
                    $set: {
                        weeklyPassword: hashed,
                        weeklyPasswordExpiresAt: expiresAt,
                        email: ADMIN_EMAIL,
                        username: 'Super Admin',
                        role: 'admin',
                        isActive: true
                    }
                },
                { upsert: true, new: true }
            );

            return responseHandler.success(res, 'Weekly password set successfully', {
                password: plainPassword,          // plain text — only returned once
                expiresAt: expiresAt.toISOString(),
                expiresInDays: EXPIRY_DAYS
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};

/** GET /api/admin/settings/weekly-password
 *  Returns expiry info (no plain password).
 */
export const getWeeklyPasswordInfo = {
    handler: async (req, res) => {
        try {
            const admin = await Admin.findOne({ email: ADMIN_EMAIL }).select(
                'weeklyPassword weeklyPasswordExpiresAt'
            );

            if (!admin?.weeklyPassword) {
                return responseHandler.success(res, 'No weekly password set', {
                    hasWeeklyPassword: false,
                    expiresAt: null,
                    isExpired: false,
                    daysRemaining: null
                });
            }

            const now = new Date();
            const expiresAt = admin.weeklyPasswordExpiresAt;
            const isExpired = expiresAt ? expiresAt < now : true;
            const msRemaining = expiresAt ? expiresAt - now : 0;
            const daysRemaining = isExpired ? 0 : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

            return responseHandler.success(res, 'Weekly password info', {
                hasWeeklyPassword: !!admin.weeklyPassword,
                expiresAt: expiresAt?.toISOString() ?? null,
                isExpired,
                daysRemaining
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};

/** Clear weekly password */
export const clearWeeklyPassword = {
    handler: async (req, res) => {
        try {
            await Admin.findOneAndUpdate(
                { email: ADMIN_EMAIL },
                { $set: { weeklyPassword: null, weeklyPasswordExpiresAt: null } }
            );
            return responseHandler.success(res, 'Weekly password cleared');
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
