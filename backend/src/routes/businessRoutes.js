import { Router } from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { uploadBusinessImages } from '../middleware/upload.middleware.js';
import * as businessController from '../controllers/businessController/index.js';

const router = Router();

// Public routes
router.get('/', businessController.listBusinesses.handler);
router.get('/nearby', businessController.getNearbyBusinesses.handler);
router.get('/:id', businessController.getBusinessById.handler);

// Protected routes - Business Owner only
router.post('/',
    auth,
    authorize(['business_owner']),
    uploadBusinessImages(),
    businessController.createBusiness.validator,
    businessController.createBusiness.handler
);

// Protected routes (require authentication)

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





