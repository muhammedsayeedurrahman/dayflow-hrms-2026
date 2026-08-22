import { Router } from 'express';
import {
  getMyPayroll,
  getAllPayroll,
  updatePayroll,
  getPayrollStats,
} from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes
router.get('/me', authenticate, getMyPayroll);

// Admin/HR routes
router.get('/stats', authenticate, authorize('HR', 'ADMIN'), getPayrollStats);
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllPayroll);
router.put('/:employeeId', authenticate, authorize('HR', 'ADMIN'), updatePayroll);

export default router;
