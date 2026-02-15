import Joi from 'joi';
import { Business } from '../../models/index.js';
import responseHandler from '../../utils/responseHandler.js';
import validator from '../../utils/validator.js';
import { deleteFromCloudinary } from '../../middleware/upload.middleware.js';

export default {
    validator: validator({
        body: Joi.object({
            name: Joi.string().trim().max(200).optional(),
            type: Joi.string().valid('restaurant', 'cafe', 'shop', 'service', 'other').optional(),
            category: Joi.string().trim().optional(),
            subcategory: Joi.string().trim().optional(),
            description: Joi.string().max(2000).optional(),
            coverImages: Joi.array().items(Joi.string().uri()).optional(),
            location: Joi.object({
                address: Joi.string().optional(),
                city: Joi.string().optional(),
                state: Joi.string().optional(),
                country: Joi.string().optional(),
                pincode: Joi.string().optional(),
                coordinates: Joi.object({
                    coordinates: Joi.array().items(Joi.number()).length(2).optional()
                }).optional()
            }).optional(),
            contact: Joi.object({
                phone: Joi.string().optional(),
                whatsapp: Joi.string().optional(),
                email: Joi.string().email().optional(),
                website: Joi.string().uri().optional()
            }).optional(),
            businessHours: Joi.array().items(
                Joi.object({
                    day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
                    open: Joi.string().required(),
                    close: Joi.string().required(),
                    isClosed: Joi.boolean().optional()
                })
            ).optional(),
            menuPDF: Joi.string().uri().optional()
        })
    }),
    handler: async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.userData?._id?.toString();
        const userRole = req.user?.role || req.userData?.role;

        const business = await Business.findById(id);

        if (!business) {
            return responseHandler.notFound(res, 'Business not found');
        }

        // Check if user is owner or admin
        const isOwner = (business.owner && business.owner.toString() === userId) ||
                       (business.createdBy && business.createdBy.toString() === userId);
        const isAdmin = userRole === 'admin';
        
        // Allow business_owner role users to claim/update businesses
        const isBusinessOwnerRole = userRole === 'business_owner';

        if (!isOwner && !isAdmin && !isBusinessOwnerRole) {
            return responseHandler.forbidden(
                res,
                'Unauthorized: Only business owner or admin can update this business'
            );
        }
        
        // If user has business_owner role but is not the owner, assign them as owner
        if (isBusinessOwnerRole && !isOwner) {
            business.owner = userId;
            business.isClaimed = true;
        }

        // Helper function to extract publicId from Cloudinary URL
        const getPublicIdFromUrl = (url) => {
            if (!url) return null;
            try {
                // Skip external URLs
                if (!url.includes('cloudinary.com')) return null;
                
                const parts = url.split('/');
                const uploadIndex = parts.indexOf('upload');
                if (uploadIndex === -1) return null;
                
                let pathParts = parts.slice(uploadIndex + 1);
                if (pathParts[0] && pathParts[0].startsWith('v')) {
                    pathParts = pathParts.slice(1);
                }
                
                const fullPath = pathParts.join('/');
                return fullPath.substring(0, fullPath.lastIndexOf('.'));
            } catch (error) {
                return null;
            }
        };
        
        // Handle logo upload from Cloudinary middleware
        if (req.uploadedFile) {
            // Delete old logo from Cloudinary if exists
            if (business.logo) {
                const oldPublicId = getPublicIdFromUrl(business.logo);
                if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId).catch(() => {});
                }
            }
            business.logo = req.uploadedFile.url;
        }
        
        // Handle cover images upload from Cloudinary middleware
        if (req.uploadedFiles && req.uploadedFiles.length > 0) {
            // Delete old cover images from Cloudinary
            if (business.coverImages && business.coverImages.length > 0) {
                for (const oldImage of business.coverImages) {
                    const oldPublicId = getPublicIdFromUrl(oldImage);
                    if (oldPublicId) {
                        await deleteFromCloudinary(oldPublicId).catch(() => {});
                    }
                }
            }
            
            const newCoverImages = req.uploadedFiles.map(f => f.url);
            // Replace existing cover images with new ones
            business.coverImages = newCoverImages;
        }

        // Fields that can be updated
        const allowedUpdates = [
            'name',
            'type',
            'category',
            'subcategory',
            'description',
            'location',
            'contact',
            'businessHours',
            'menuPDF'
        ];

        // Update only allowed fields
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                business[field] = req.body[field];
            }
        });
        
        // Fix coordinates format if it exists but is malformed
        if (business.location && business.location.coordinates) {
            if (!business.location.coordinates.type) {
                // If coordinates exist but type is missing, add it
                if (business.location.coordinates.coordinates && 
                    Array.isArray(business.location.coordinates.coordinates) && 
                    business.location.coordinates.coordinates.length === 2) {
                    business.location.coordinates.type = 'Point';
                } else {
                    // If coordinates are completely malformed, remove them
                    business.location.coordinates = undefined;
                }
            }
        }

        await business.save();

        return responseHandler.success(res, 'Business updated successfully', business);

    } catch (error) {
        return responseHandler.error(res, error?.message || 'Failed to update business');
    }
    }
};


