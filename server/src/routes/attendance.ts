import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getTodayStatus,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes
router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/me', authenticate, getMyAttendance);
router.get('/today', authenticate, getTodayStatus);

// Admin/HR routes
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllAttendance);

export default router;
