import express from 'express';
import { createTemplate, startJourney, updateTask, getJourney, getAllJourneys } from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/templates', createTemplate);
router.post('/journey', startJourney);
router.put('/journey/:journeyId/task/:taskIndex', updateTask);
router.get('/journeys', getAllJourneys);
router.get('/journey/:employeeId', getJourney);

export default router;
