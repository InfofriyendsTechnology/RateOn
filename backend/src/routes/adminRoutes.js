import { Router } from 'express';
import { 
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

// All admin routes require authentication and admin role
router.use(auth);
router.use(authorize(['admin']));

// Platform statistics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.put('/users/:id/ban', banUser);

export default router;





