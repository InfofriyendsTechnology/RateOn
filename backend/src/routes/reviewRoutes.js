import { Router } from 'express';
import auth from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import * as reviewController from '../controllers/reviewController/index.js';

const router = Router();

// Public routes
router.get('/item/:itemId', 
    reviewController.getReviewsByItem.validator, 
    reviewController.getReviewsByItem.handler
);

router.get('/business/:businessId', 
    reviewController.getReviewsByBusiness.validator, 
    reviewController.getReviewsByBusiness.handler
);

router.get('/user/:userId', 
    reviewController.getReviewsByUser.validator, 
    reviewController.getReviewsByUser.handler
);

router.get('/:id', 
    reviewController.getReviewById.validator, 
    reviewController.getReviewById.handler
);

// Protected routes (require authentication)
router.post('/',
    auth,
    uploadMultiple('images', 5, 'rateon/reviews'),
    reviewController.createReview.handler
);

router.put('/:id',
    auth,
    uploadMultiple('images', 5, 'rateon/reviews'),
    reviewController.updateReview.validator,
    reviewController.updateReview.handler
);

router.delete('/:id',
    auth,
    reviewController.deleteReview.validator,
    reviewController.deleteReview.handler
);

export default router;





