import express from 'express';
import { createGoal, getAllGoals, updateGoalProgress, createFeedbackRequest, submitFeedback, getFeedbackRequests } from '../controllers/performanceController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/goals', createGoal);
router.get('/goals', getAllGoals);
router.put('/goals/:id/progress', updateGoalProgress);
router.post('/feedback/request', createFeedbackRequest);
router.post('/feedback/:requestId/submit', submitFeedback);
router.get('/feedback/requests', getFeedbackRequests);

export default router;
