import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Employee routes (authenticated)
router.get('/profile', authenticate, getMyProfile);
router.put('/profile', authenticate, updateMyProfile);

// Admin/HR routes
router.get('/', authenticate, authorize('HR', 'ADMIN'), getAllEmployees);
router.get('/:id', authenticate, authorize('HR', 'ADMIN'), getEmployeeById);
router.put('/:id', authenticate, authorize('HR', 'ADMIN'), updateEmployee);

export default router;
