import { Router } from 'express';
import {
  getMyPayroll,
  getAllPayroll,
  updatePayroll,
} from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes
router.get('/me', authenticate, getMyPayroll);

// Admin/HR routes
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllPayroll);
router.put('/:employeeId', authenticate, authorize('HR', 'ADMIN'), updatePayroll);

export default router;
