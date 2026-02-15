import Joi from 'joi';
import { Review, Item, Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { deleteFromCloudinary } from '../../middleware/upload.middleware.js';

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            rating: Joi.number().min(1).max(5).optional(),
            title: Joi.string().trim().max(100).optional(),
            comment: Joi.string().trim().max(2000).optional(),
            images: Joi.array().items(Joi.string().uri()).optional(),
            existingImages: Joi.string().optional() // JSON string of existing image URLs to keep
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { rating, title, comment } = req.body;

            // Find review
            const review = await Review.findById(id);
            if (!review) {
                return responseHandler.notFound(res, 'Review not found');
            }

            // Check ownership
            if (review.userId.toString() !== userId) {
                return responseHandler.forbidden(res, 'You can only edit your own reviews');
            }

            const oldRating = review.rating;
            let ratingChanged = false;

            // Handle image updates similar to items
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
            } else if (Array.isArray(review.images)) {
                // If existingImages not provided, default to keeping all current images
                imagesToKeep = [...review.images];
                finalImages = [...review.images];
            }

            // Delete removed images from Cloudinary (those present before but not in imagesToKeep)
            if (Array.isArray(review.images) && Array.isArray(imagesToKeep)) {
                const currentImages = review.images || [];
                const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));

                if (imagesToDelete.length > 0) {
                    for (const imageUrl of imagesToDelete) {
                        try {
                            const urlParts = imageUrl.split('/upload/');
                            if (urlParts.length === 2) {
                                const pathWithVersion = urlParts[1];
                                const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, '');
                                const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');
                                await deleteFromCloudinary(publicId);
                            } else {
                            }
                        } catch (error) {
                        }
                    }
                }
            }

            // 2. Add newly uploaded images (from uploadMultiple middleware)
            if (req.uploadedFiles && req.uploadedFiles.length > 0) {
                const newImageUrls = req.uploadedFiles
                    .map(file => file.url)
                    .filter(url => url);
                finalImages = [...finalImages, ...newImageUrls];
            }

            // 3. If images were provided via JSON body (no file upload, just URL update)
            if (req.body.images && Array.isArray(req.body.images)) {
                finalImages = req.body.images.filter(img => img);
            }

            // Update fields
            if (rating !== undefined && rating !== oldRating) {
                review.rating = rating;
                ratingChanged = true;
            }
            if (title !== undefined) review.title = title;
            if (comment !== undefined) review.comment = comment;

            // Update images if we have any list (allow clearing by sending empty array)
            if (finalImages && Array.isArray(finalImages)) {
                review.images = finalImages.filter(img => img);
            }

            review.isEdited = true;
            review.editedAt = new Date();

            await review.save();

            // If rating changed, update item and business ratings
            if (ratingChanged) {
                const item = await Item.findById(review.itemId);
                if (item) {
                    // Remove old rating and add new one
                    await item.updateRating(oldRating, 'remove');
                    await item.updateRating(rating, 'add');
                }

                // Recalculate business rating
                const business = await Business.findById(review.businessId);
                if (business) {
                    const businessItems = await Item.find({ businessId: review.businessId });
                    let totalRating = 0;
                    let totalReviews = 0;
                    
                    businessItems.forEach(item => {
                        if (item.reviewCount > 0) {
                            totalRating += item.averageRating * item.reviewCount;
                            totalReviews += item.reviewCount;
                        }
                    });

                    if (totalReviews > 0) {
                        business.rating.average = totalRating / totalReviews;
                        
                        // Update rating distribution
                        const allReviews = await Review.find({ businessId: review.businessId, isActive: true });
                        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        allReviews.forEach(r => {
                            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                        });
                        business.rating.distribution = distribution;
                        
                        await business.save();
                    }
                }
            }

            // Populate for response
            await review.populate([
                { path: 'userId', select: 'username profile.firstName profile.lastName profile.avatar trustScore level' },
                { path: 'itemId', select: 'name images' },
                { path: 'businessId', select: 'name' }
            ]);

            return responseHandler.success(res, 'Review updated successfully', review);

        } catch (error) {
            return responseHandler.error(res, error?.message || 'Failed to update review');
        }
    }
};


