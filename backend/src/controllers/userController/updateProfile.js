import Joi from "joi";
import { User } from "../../models/index.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    validator: validator({
        body: Joi.object({
            firstName: Joi.string().trim().max(50).optional(),
            lastName: Joi.string().trim().max(50).optional(),
            bio: Joi.string().max(500).optional().allow(''),
            avatar: Joi.string().uri().optional().allow(null, ''),
            location: Joi.string().max(100).optional().allow(''),
            dateOfBirth: Joi.date().optional().allow(null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { firstName, lastName, bio, avatar, location, dateOfBirth } = req.body;

            const profileUpdates = {};
            if (firstName !== undefined) profileUpdates['profile.firstName'] = firstName;
            if (lastName !== undefined) profileUpdates['profile.lastName'] = lastName;
            if (bio !== undefined) profileUpdates['profile.bio'] = bio;
            if (avatar !== undefined) profileUpdates['profile.avatar'] = avatar;
            if (location !== undefined) profileUpdates['profile.location'] = location;
            if (dateOfBirth !== undefined) profileUpdates['profile.dateOfBirth'] = dateOfBirth;

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $set: profileUpdates },
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                return responseHandler.error(res, "User not found");
            }

            return responseHandler.success(res, "Profile updated successfully", updatedUser);

        } catch (error) {
            return responseHandler.error(res, error?.message || "Failed to update profile");
        }
    }
}


