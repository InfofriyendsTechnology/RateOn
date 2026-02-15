import { Router } from 'express';
import auth from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController/index.js';

const router = Router();

// All routes below require authentication
router.get('/',
    auth,
    notificationController.getNotifications.validator,
    notificationController.getNotifications.handler
);

router.put('/:id/read',
    auth,
    notificationController.markAsRead.validator,
    notificationController.markAsRead.handler
);

router.put('/read-all',
    auth,
    notificationController.markAllAsRead.validator,
    notificationController.markAllAsRead.handler
);

router.delete('/:id',
    auth,
    notificationController.deleteNotification.validator,
    notificationController.deleteNotification.handler
);

export default router;
