import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import responseHandler from '../utils/responseHandler.js';

// Multer memory storage
const storage = multer.memoryStorage();

// File filter - accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Upload to Cloudinary from buffer
const uploadToCloudinary = async (fileBuffer, folder = 'rateon') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                format: 'webp', // Convert to WebP for better compression
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            }
        );
        
        uploadStream.end(fileBuffer);
    });
};

// Middleware to upload single file
export const uploadSingle = (fieldName, folder = 'rateon') => {
    return async (req, res, next) => {
        upload.single(fieldName)(req, res, async (err) => {
            if (err) {
                return responseHandler.badRequest(res, err.message);
            }
            
            if (!req.file) {
                return next();
            }
            
            try {
                const result = await uploadToCloudinary(req.file.buffer, folder);
                req.uploadedFile = result;
                next();
            } catch (error) {
                return responseHandler.internalServerError(res, 'Failed to upload file to cloud storage');
            }
        });
    };
};

// Middleware to upload multiple files
export const uploadMultiple = (fieldName, maxCount = 5, folder = 'rateon') => {
    return async (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, async (err) => {
            if (err) {
                return responseHandler.badRequest(res, err.message);
            }
            
            if (!req.files || req.files.length === 0) {
                return next();
            }
            
            try {
                const uploadPromises = req.files.map(file => 
                    uploadToCloudinary(file.buffer, folder)
                );
                const results = await Promise.all(uploadPromises);
                req.uploadedFiles = results;
                next();
            } catch (error) {
                return responseHandler.internalServerError(res, 'Failed to upload files to cloud storage');
            }
        });
    };
};

// Middleware for business images (logo + cover images)
export const uploadBusinessImages = () => {
    return async (req, res, next) => {
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'coverImages', maxCount: 5 }
        ])(req, res, async (err) => {
            if (err) {
                return responseHandler.badRequest(res, err.message);
            }
            
            try {
                // Upload logo if provided
                if (req.files && req.files['logo'] && req.files['logo'][0]) {
                    const logoFile = req.files['logo'][0];
                    const logoResult = await uploadToCloudinary(logoFile.buffer, 'rateon/business/logos');
                    req.uploadedFile = logoResult;
                }
                
                // Upload cover images if provided
                if (req.files && req.files['coverImages'] && req.files['coverImages'].length > 0) {
                    const coverFiles = req.files['coverImages'];
                    const uploadPromises = coverFiles.map(file => 
                        uploadToCloudinary(file.buffer, 'rateon/business/covers')
                    );
                    const results = await Promise.all(uploadPromises);
                    req.uploadedFiles = results;
                }
                
                next();
            } catch (error) {
                return responseHandler.internalServerError(res, 'Failed to upload images to cloud storage');
            }
        });
    };
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
            invalidate: true  // Invalidate CDN cache
        });
        
        if (result.result === 'ok' || result.result === 'not found') {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

export default upload;
