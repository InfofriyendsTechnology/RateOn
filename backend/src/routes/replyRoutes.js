import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as replyController from '../controllers/replyController/index.js';

const router = Router();

// All routes require authentication (business owner only)
router.post('/review/:reviewId',
    auth,
    replyController.addOwnerResponse.validator,
    replyController.addOwnerResponse.handler
);

router.put('/review/:reviewId',
    auth,
    replyController.updateOwnerResponse.validator,
    replyController.updateOwnerResponse.handler
);

export default router;





