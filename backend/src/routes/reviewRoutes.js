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

// Get review with threaded replies (public)
router.get('/:id/with-replies',
    reviewController.getReviewWithReplies.validator,
    reviewController.getReviewWithReplies.handler
);

// Get review statistics (public, with optional auth for user reaction)
router.get('/:id/statistics',
    reviewController.getReviewStatistics.validator,
    reviewController.getReviewStatistics.handler
);

// Protected routes (require authentication)
router.post('/',
    auth,
    uploadMultiple('images', 5, 'rateon/reviews'),
    reviewController.createReview.handler
);

// Create business review (no item)
router.post('/business',
    auth,
    uploadMultiple('images', 5, 'rateon/reviews'),
    reviewController.createBusinessReview.handler
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

// Report a review (requires authentication)
router.post('/:id/report',
    auth,
    reviewController.reportReview.validator,
    reviewController.reportReview.handler
);

// Business owner reply to review (requires authentication and ownership)
router.post('/:id/reply',
    auth,
    reviewController.replyToReview.validator,
    reviewController.replyToReview.handler
);

export default router;





