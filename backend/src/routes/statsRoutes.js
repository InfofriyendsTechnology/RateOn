import { Router } from 'express';
import { getPlatformStats } from '../controllers/statsController.js';

const router = Router();

// Public route - no authentication required
router.get('/platform', getPlatformStats);

export default router;
