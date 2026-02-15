import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as replyController from '../controllers/reply/index.js';

const router = Router();

// Create a new reply (authenticated users)
router.post('/',
    auth,
    replyController.createReply.validator,
    replyController.createReply.handler
);

// Get all replies for a review (public)
router.get('/review/:reviewId',
    replyController.getRepliesByReview.validator,
    replyController.getRepliesByReview.handler
);

// Update a reply (owner only)
router.put('/:id',
    auth,
    replyController.updateReply.validator,
    replyController.updateReply.handler
);

// Delete a reply (owner only)
router.delete('/:id',
    auth,
    replyController.deleteReply.validator,
    replyController.deleteReply.handler
);

export default router;





