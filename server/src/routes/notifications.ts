import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
} from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, getMyNotifications);
router.put('/read-all', authenticate, markAllAsRead);
router.post('/broadcast', authenticate, authorize('HR', 'ADMIN'), broadcastNotification);
router.put('/:id/read', authenticate, markAsRead);

export default router;
