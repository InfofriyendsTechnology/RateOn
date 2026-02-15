import Joi from 'joi';
import { Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { deleteFromCloudinary } from '../../middleware/upload.middleware.js';

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().max(200).optional(),
            description: Joi.string().max(1000).optional(),
            price: Joi.number().min(0).optional(),
            images: Joi.array().items(Joi.string().uri()).optional(),
            existingImages: Joi.string().optional(), // JSON string of existing image URLs to keep
            category: Joi.string().trim().optional(),
            availability: Joi.object({
                status: Joi.string().valid('available', 'out_of_stock', 'coming_soon').optional(),
                availableUntil: Joi.date().optional(),
                note: Joi.string().max(200).optional()
            }).optional(),
            isActive: Joi.boolean().optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Item.findById(id);
        if (!item) {
            return responseHandler.notFound(res, 'Item not found');
        }

        // Check authorization
        const business = await Business.findById(item.businessId);
        const isOwner = business.owner && business.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return responseHandler.forbidden(
                res,
                'Unauthorized: Only business owner can update items'
            );
        }

        // Handle image updates
        let finalImages = [];
        let imagesToKeep = [];
        
        // 1. Keep existing images that user wants to keep
        if (req.body.existingImages) {
            try {
                imagesToKeep = JSON.parse(req.body.existingImages);
                if (Array.isArray(imagesToKeep)) {
                    finalImages = [...imagesToKeep];
                }
            } catch (e) {
            }
        }
        
        // Delete removed images from Cloudinary
        const currentImages = item.images || [];
        const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));
        
        if (imagesToDelete.length > 0) {
            for (const imageUrl of imagesToDelete) {
                try {
                    // Extract public_id from Cloudinary URL
                    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{id}.{format}
                    // Example: https://res.cloudinary.com/xxx/image/upload/v123/rateon/items/abc123.webp
                    const urlParts = imageUrl.split('/upload/');
                    if (urlParts.length === 2) {
                        // Get everything after /upload/ and before the file extension
                        const pathWithVersion = urlParts[1];
                        // Remove version number (v123456/)
                        const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
                        // Remove file extension
                        const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');
                        const deleted = await deleteFromCloudinary(publicId);
                    } else {
                    }
                } catch (error) {
                }
            }
        }
        
        // 2. Add newly uploaded images (from uploadMultiple middleware)
        if (req.uploadedFiles && req.uploadedFiles.length > 0) {
            const newImageUrls = req.uploadedFiles.map(file => file.url).filter(url => url);
            finalImages = [...finalImages, ...newImageUrls];
        }
        
        // 3. If images were provided via JSON body (no file upload, just URL update)
        if (req.body.images && Array.isArray(req.body.images)) {
            finalImages = req.body.images.filter(img => img);
        }

        // Update fields
        const allowedUpdates = [
            'name',
            'description',
            'price',
            'category',
            'availability',
            'isActive'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });
        
        // Update images if we have any (filter out null/undefined)
        if (finalImages.length > 0) {
            item.images = finalImages.filter(img => img);
        }

        await item.save();

        return responseHandler.success(res, 'Item updated successfully', item);

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to update item');
    }
    }
};


