import express from 'express';
import { createJob, getAllJobs, getCandidates, updateCandidateStage, screenResume } from '../controllers/recruitmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/', createJob);
router.get('/', getAllJobs);
router.get('/:jobId/candidates', getCandidates);
router.put('/candidates/:candidateId/stage', updateCandidateStage);
router.post('/screen-resume', screenResume);

export default router;
