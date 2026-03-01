import { Router } from 'express';
import { 
    followUser, 
    unfollowUser, 
    getFollowers, 
    getFollowing, 
    checkFollowStatus,
    checkFollowsMe
} from '../controllers/followController/index.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public routes - no auth needed to view lists
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

// Protected routes - require authentication
router.post('/:userId', auth, followUser);
router.delete('/:userId', auth, unfollowUser);
router.get('/status/:userId', auth, checkFollowStatus);
router.get('/follows-me/:userId', auth, checkFollowsMe);

export default router;





