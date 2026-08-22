import express from 'express';
import { createCourse, getAllCourses, enrollEmployee, updateProgress, getMyCourses } from '../controllers/learningController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

router.post('/', createCourse);
router.get('/', getAllCourses);
router.post('/enroll', enrollEmployee);
router.put('/enrollment/:enrollmentId/progress', updateProgress);
router.get('/my-courses', getMyCourses);

export default router;
