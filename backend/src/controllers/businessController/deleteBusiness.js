import { Business, Item, Review, User } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import cloudinary from '../../config/cloudinary.js';

export default {
    handler: async (req, res) => {
        try {
            const businessId = req.params.id;
            const userId = req.user.id;

            // Find the business
            const business = await Business.findById(businessId);
            
            if (!business) {
                return responseHandler.error(res, 'Business not found', 404);
            }

            // Verify ownership
            if (business.owner.toString() !== userId) {
                return responseHandler.error(res, 'You are not authorized to delete this business', 403);
            }

            // 1. Delete all items associated with this business
            const items = await Item.find({ businessId });
            await Item.deleteMany({ businessId });

            // 2. Delete all reviews for items in this business
            const itemIds = items.map(item => item._id);
            const reviews = await Review.find({ itemId: { $in: itemIds } });
            await Review.deleteMany({ itemId: { $in: itemIds } });

            // 3. Delete images from Cloudinary
            const imagesToDelete = [];
            
            // Business logo
            if (business.logo) {
                imagesToDelete.push(business.logo);
            }
            
            // Business cover images
            if (business.coverImages && business.coverImages.length > 0) {
                imagesToDelete.push(...business.coverImages);
            }
            
            // Item images
            items.forEach(item => {
                if (item.images && item.images.length > 0) {
                    imagesToDelete.push(...item.images);
                }
            });
            
            // Review images
            reviews.forEach(review => {
                if (review.images && review.images.length > 0) {
                    imagesToDelete.push(...review.images);
                }
            });

            // Delete images from Cloudinary
            for (const imageUrl of imagesToDelete) {
                try {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('Failed to delete image from Cloudinary:', error);
                }
            }

            // 4. Delete the business
            await Business.findByIdAndDelete(businessId);

            // 5. Update user - convert business owner back to regular user
            await User.findByIdAndUpdate(userId, {
                role: 'user'
            });

            return responseHandler.success(
                res,
                'Business account deleted successfully. You have been converted to a regular user account.',
                {
                    deleted: {
                        business: 1,
                        items: items.length,
                        reviews: reviews.length,
                        images: imagesToDelete.length
                    }
                }
            );

        } catch (error) {
            console.error('Delete business error:', error);
            return responseHandler.error(res, error?.message || 'Failed to delete business');
        }
    }
};
