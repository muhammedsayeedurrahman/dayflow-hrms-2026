import express from 'express';
import { submitClaim, getAllClaims, approveClaim, rejectClaim } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/', submitClaim);
router.get('/', getAllClaims);
router.put('/:id/approve', approveClaim);
router.put('/:id/reject', rejectClaim);

export default router;
