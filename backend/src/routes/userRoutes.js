import { Router } from "express";
import auth from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    deleteUserProfile
} from '../controllers/userController/profile.js';

const router = Router();

// Profile routes (all require authentication)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, uploadSingle('avatar', 'rateon/avatars'), updateUserProfile);
router.post('/profile/avatar', auth, uploadSingle('avatar', 'rateon/avatars'), uploadAvatar);
router.delete('/profile', auth, deleteUserProfile);

export default router;





