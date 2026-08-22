import { Router } from 'express';
import {
  uploadDocument,
  getEmployeeDocuments,
  downloadDocument,
  deleteDocument,
  getAllDocuments,
  upload,
} from '../controllers/documentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Upload document (authenticated users)
router.post(
  '/upload',
  authenticate,
  upload.single('document'),
  uploadDocument
);

// Get documents for specific employee
router.get(
  '/employee/:employeeId',
  authenticate,
  getEmployeeDocuments
);

// Download document
router.get(
  '/:id/download',
  authenticate,
  downloadDocument
);

// Delete document
router.delete(
  '/:id',
  authenticate,
  deleteDocument
);

// Get all documents (Admin/HR only)
router.get(
  '/',
  authenticate,
  authorize('HR', 'ADMIN'),
  getAllDocuments
);

export default router;
