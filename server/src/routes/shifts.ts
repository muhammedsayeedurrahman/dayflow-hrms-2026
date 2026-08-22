import express from 'express';
import { createShift, assignShift, getShifts, requestSwap } from '../controllers/shiftController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/', createShift);
router.put('/:id/assign', assignShift);
router.get('/', getShifts);
router.post('/swap/request', requestSwap);

export default router;
