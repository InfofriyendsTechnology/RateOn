import Joi from 'joi';
import { Notification } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const notification = await Notification.findOneAndDelete({ _id: id, userId });
            if (!notification) {
                return responseHandler.notFound(res, 'Notification not found');
            }

            return responseHandler.success(res, 'Notification deleted successfully', { id });
        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to delete notification');
        }
    }
};
