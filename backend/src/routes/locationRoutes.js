import { Router } from 'express';
import * as locationController from '../controllers/locationController/index.js';

const router = Router();

// Public routes - no authentication required
router.get('/countries', locationController.getCountries.handler);
router.get('/states', locationController.getStatesByCountry.handler);
router.get('/cities', locationController.getCitiesByState.handler);
router.post('/detect-ip', locationController.detectLocationFromIP.handler);

export default router;
