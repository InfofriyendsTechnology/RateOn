import { Router } from 'express';
import { 
    getTopReviewers, 
    getMostActiveUsers, 
    getTopContributorsByCategory 
} from '../controllers/leaderboardController/index.js';

const router = Router();

// Public routes - anyone can view leaderboards
router.get('/top-reviewers', getTopReviewers);
router.get('/most-active', getMostActiveUsers);
router.get('/category/:category', getTopContributorsByCategory);

export default router;





