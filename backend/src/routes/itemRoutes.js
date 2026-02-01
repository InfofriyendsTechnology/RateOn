import { Router } from 'express';
import auth from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import * as itemController from '../controllers/itemController/index.js';

const router = Router();

// Public routes
router.get('/search', itemController.searchItems.handler);
router.get('/:id', itemController.getItemById.handler);
router.get('/business/:businessId', itemController.getItemsByBusiness.handler);

// Protected routes (require authentication and business ownership)
router.post('/business/:businessId',
    auth,
    uploadMultiple('images', 5, 'rateon/items'),
    itemController.createItem.handler
);

router.put('/:id',
    auth,
    uploadMultiple('images', 5, 'rateon/items'),
    itemController.updateItem.validator,
    itemController.updateItem.handler
);

router.patch('/:id/availability',
    auth,
    itemController.updateAvailability.validator,
    itemController.updateAvailability.handler
);

export default router;





