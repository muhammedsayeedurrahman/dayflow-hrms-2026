import { Router } from 'express';
import {
  handleChatbotQuery,
  getChatbotStatus,
} from '../controllers/chatbotController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All chatbot routes require authentication
router.use(authenticate);

// Get chatbot status
router.get('/status', getChatbotStatus);

// Handle chatbot query
router.post('/query', handleChatbotQuery);

export default router;
