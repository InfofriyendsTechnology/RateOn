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

// All routes require authentication
router.use(auth);

// Follow/Unfollow a user
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get followers and following lists
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

// Check if current user is following another user
router.get('/status/:userId', checkFollowStatus);

// Check if another user is following the current user
router.get('/follows-me/:userId', checkFollowsMe);

export default router;





