import { Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import { deleteFromCloudinary } from '../../middleware/upload.middleware.js';

export default {
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const item = await Item.findById(id);
            if (!item) {
                return responseHandler.notFound(res, 'Item not found');
            }

            if (!item.isActive) {
                return responseHandler.notFound(res, 'Item not found');
            }

            // Check authorization
            const business = await Business.findById(item.businessId);
            if (!business) {
                return responseHandler.notFound(res, 'Business not found');
            }

            const isOwner = business.owner && business.owner.toString() === req.user.id;
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return responseHandler.forbidden(
                    res,
                    'Unauthorized: Only business owner can delete items'
                );
            }

            // Soft delete
            item.isActive = false;
            await item.save();

            // Update business stats
            business.stats.totalItems = Math.max(0, business.stats.totalItems - 1);
            await business.save();

            // Delete images from Cloudinary (best-effort)
            if (item.images && item.images.length > 0) {
                for (const imageUrl of item.images) {
                    try {
                        const urlParts = imageUrl.split('/upload/');
                        if (urlParts.length === 2) {
                            const pathWithoutVersion = urlParts[1].replace(/^v\d+\//, '');
                            const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');
                            await deleteFromCloudinary(publicId);
                        }
                    } catch (_) {}
                }
            }

            return responseHandler.success(res, 'Item deleted successfully');

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to delete item');
        }
    }
};
