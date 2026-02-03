import { Router } from 'express';
import { 
    adminLogin,
    adminLogout,
    getUserAnalytics,
    getContentAnalytics,
    getPlatformStats,
    getUsers,
    getUserDetails,
    suspendUser,
    unsuspendUser,
    banUser
} from '../controllers/adminController/index.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// Public admin routes (no auth required)
router.post('/login', adminLogin.validator, adminLogin.handler);

// All routes below require authentication and admin role
router.use(auth);
router.use(authorize(['admin']));

// Admin logout
router.post('/logout', adminLogout.handler);

// Analytics endpoints
router.get('/analytics/users', getUserAnalytics.handler);
router.get('/analytics/content', getContentAnalytics.handler);

// Platform statistics (existing)
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.put('/users/:id/ban', banUser);

export default router;





