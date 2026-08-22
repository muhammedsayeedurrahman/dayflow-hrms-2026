import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getEmployeeStats,
  getEmployeeAttendance,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes (authenticated)
router.get('/profile', authenticate, getMyProfile);
router.put('/profile', authenticate, updateMyProfile);

// Admin/HR routes
router.get('/stats', authenticate, authorize('HR', 'ADMIN'), getEmployeeStats);
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllEmployees);
router.get('/:id', authenticate, authorize('HR', 'ADMIN'), getEmployeeById);
router.get('/:id/attendance', authenticate, getEmployeeAttendance);
router.put('/:id', authenticate, authorize('HR', 'ADMIN'), updateEmployee);

export default router;
