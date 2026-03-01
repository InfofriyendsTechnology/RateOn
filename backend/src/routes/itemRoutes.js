import { Router } from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import * as itemController from '../controllers/itemController/index.js';

const router = Router();

// Public routes
router.get('/search', itemController.searchItems.handler);
router.get('/:id', itemController.getItemById.handler);
router.get('/business/:businessId', itemController.getItemsByBusiness.handler);

// Protected routes (require business_owner role)
router.post('/business/:businessId',
    auth,
    authorize(['business_owner']),
    uploadMultiple('images', 5, 'rateon/items'),
    itemController.createItem.handler
);

router.put('/:id',
    auth,
    authorize(['business_owner']),
    uploadMultiple('images', 5, 'rateon/items'),
    itemController.updateItem.validator,
    itemController.updateItem.handler
);

router.patch('/:id/availability',
    auth,
    authorize(['business_owner']),
    itemController.updateAvailability.validator,
    itemController.updateAvailability.handler
);

router.delete('/:id',
    auth,
    authorize(['business_owner']),
    itemController.deleteItem.handler
);

export default router;





