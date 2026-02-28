import { Router } from "express";
import auth from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    deleteUserProfile
} from '../controllers/userController/profile.js';
import { becomeBusinessOwner } from '../controllers/userController/index.js';
import getUserById from '../controllers/userController/getUserById.js';

const router = Router();

// Profile routes (all require authentication)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, uploadSingle('avatar', 'rateon/avatars'), updateUserProfile);
router.post('/profile/avatar', auth, uploadSingle('avatar', 'rateon/avatars'), uploadAvatar);
router.delete('/profile', auth, deleteUserProfile);

// Role conversion
router.post('/become-business-owner', auth, becomeBusinessOwner.handler);

// Public profile view by user ID (no auth required)
router.get('/:userId', getUserById.handler);

export default router;





