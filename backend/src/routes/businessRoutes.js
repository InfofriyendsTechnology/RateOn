import { Router } from 'express';
import auth from '../middleware/auth.js';
import { uploadBusinessImages } from '../middleware/upload.middleware.js';
import * as businessController from '../controllers/businessController/index.js';

const router = Router();

// Public routes
router.get('/', businessController.listBusinesses.handler);
router.get('/nearby', businessController.getNearbyBusinesses.handler);
router.get('/:id', businessController.getBusinessById.handler);

// Protected routes (require authentication)
// Note: Business creation is now done via /api/v1/auth/business/register

router.put('/:id',
    auth,
    uploadBusinessImages(),
    businessController.updateBusiness.validator,
    businessController.updateBusiness.handler
);

router.post('/:id/claim',
    auth,
    businessController.claimBusiness.handler
);

router.delete('/:id',
    auth,
    businessController.deleteBusiness.handler
);

export default router;





