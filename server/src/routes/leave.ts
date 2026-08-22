import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveStats,
} from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes
router.post('/apply', authenticate, applyLeave);
router.get('/me', authenticate, getMyLeaves);

// Admin/HR routes
router.get('/stats', authenticate, authorize('HR', 'ADMIN'), getLeaveStats);
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllLeaves);
router.put('/:id/status', authenticate, authorize('HR', 'ADMIN'), updateLeaveStatus);

export default router;
