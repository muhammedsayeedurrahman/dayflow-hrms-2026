import express from 'express';
import {
  generateInsights,
  getAllInsights,
  getEmployeeInsights,
  acknowledgeInsight,
  getAttritionStats,
} from '../controllers/aiInsightsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate new insights (HR/ADMIN only)
router.post('/generate', generateInsights);

// Get all insights (HR/ADMIN only)
router.get('/', getAllInsights);

// Get attrition risk statistics (HR/ADMIN only)
router.get('/attrition/stats', getAttritionStats);

// Get insights for specific employee
router.get('/employee/:employeeId', getEmployeeInsights);

// Acknowledge an insight
router.put('/:id/acknowledge', acknowledgeInsight);

export default router;
