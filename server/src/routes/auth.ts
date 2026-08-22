import { Router } from 'express';
import { signUp, signIn, verifyToken } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected routes
router.get('/verify', authenticate, verifyToken);

export default router;
