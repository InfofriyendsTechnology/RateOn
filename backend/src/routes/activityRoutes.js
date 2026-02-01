import { Router } from 'express';
import { getUserActivity, getFollowingActivity } from '../controllers/activityController/index.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// Get user's activity history
router.get('/user/:userId', getUserActivity);

// Get activity feed from followed users
router.get('/feed', getFollowingActivity);

export default router;





