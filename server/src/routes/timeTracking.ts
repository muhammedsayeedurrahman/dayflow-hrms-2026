import express from 'express';
import { createProject, getAllProjects, logTime, getMyTimeEntries, approveTimeEntry } from '../controllers/timeTrackingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/projects', createProject);
router.get('/projects', getAllProjects);
router.post('/time-entries', logTime);
router.get('/time-entries/me', getMyTimeEntries);
router.put('/time-entries/:id/approve', approveTimeEntry);

export default router;
