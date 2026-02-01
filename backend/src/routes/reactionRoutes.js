import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as reactionController from '../controllers/reactionController/index.js';

const router = Router();

// Public route - get reactions for a review
router.get('/review/:reviewId',
    reactionController.getReviewReactions.validator,
    reactionController.getReviewReactions.handler
);

// Protected routes
router.post('/',
    auth,
    reactionController.addReaction.validator,
    reactionController.addReaction.handler
);

router.delete('/review/:reviewId',
    auth,
    reactionController.removeReaction.validator,
    reactionController.removeReaction.handler
);

export default router;





