import { Router } from 'express';
import { 
    adminLogin,
    adminLogout,
    getUserAnalytics,
    getContentAnalytics,
    getUserStatistics,
    getReviewStatistics,
    getBusinessStatistics,
    getTopBusinesses,
    getLocationData,
    getRealTimeMetrics,
    getPlatformStats,
    getUsers,
    getUserDetails,
    suspendUser,
    unsuspendUser,
    banUser
} from '../controllers/adminController/index.js';
import {
    createDummyData,
    clearDummyData,
    getDummyAccounts,
    impersonateBusinessOwner,
    getSeedStats
} from '../controllers/adminController/seedDataController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// Public admin routes (no auth required)
router.post('/login', adminLogin.validator, adminLogin.handler);

// All routes below require authentication and admin role
router.use(auth);
router.use(authorize(['admin', 'super_admin']));

// Admin logout
router.post('/logout', adminLogout.handler);

// Analytics endpoints (existing)
router.get('/analytics/users', getUserAnalytics.handler);
router.get('/analytics/content', getContentAnalytics.handler);

// New analytics endpoints
router.get('/stats/users', getUserStatistics.handler);
router.get('/stats/reviews', getReviewStatistics.handler);
router.get('/stats/businesses', getBusinessStatistics.handler);
router.get('/stats/businesses/top', getTopBusinesses.handler);
router.get('/stats/locations', getLocationData.handler);
router.get('/stats/realtime', getRealTimeMetrics.handler);

// Platform statistics (existing)
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.put('/users/:id/ban', banUser);

// Seed Data Management
router.get('/seed/stats', getSeedStats.handler);
router.post('/seed/create', createDummyData.handler);
router.delete('/seed/clear', clearDummyData.handler);
router.get('/seed/accounts', getDummyAccounts.handler);
router.post('/seed/impersonate/:userId', impersonateBusinessOwner.handler);

export default router;





