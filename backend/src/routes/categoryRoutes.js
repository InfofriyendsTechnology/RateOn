import { Router } from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import * as categoryController from '../controllers/categoryController/index.js';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories.handler);

// Admin routes
router.post('/',
    auth,
    authorize('admin'),
    categoryController.createCategory.validator,
    categoryController.createCategory.handler
);

export default router;





