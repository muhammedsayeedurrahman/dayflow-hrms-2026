import express from 'express';
import {
  createSkill,
  getAllSkills,
  updateEmployeeSkills,
  getEmployeeSkills,
  getSkillsMatrix,
  analyzeSkillGaps,
  getSkillsStats,
} from '../controllers/skillsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Skills catalog management
router.post('/', createSkill); // HR/ADMIN only
router.get('/', getAllSkills);

// Skills statistics
router.get('/stats', getSkillsStats); // HR/ADMIN only

// Skills matrix (heat map)
router.get('/matrix', getSkillsMatrix); // HR/ADMIN only

// Employee skills management
router.put('/employee/:employeeId', updateEmployeeSkills);
router.get('/employee/:employeeId', getEmployeeSkills);

// Skill gap analysis
router.post('/employee/:employeeId/gap-analysis', analyzeSkillGaps);

export default router;
