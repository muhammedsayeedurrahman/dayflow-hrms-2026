import express from 'express';
import { createProgram, getAllPrograms, logActivity, getMyActivities } from '../controllers/wellBeingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/programs', createProgram);
router.get('/programs', getAllPrograms);
router.post('/activity', logActivity);
router.get('/my-activities', getMyActivities);

export default router;
