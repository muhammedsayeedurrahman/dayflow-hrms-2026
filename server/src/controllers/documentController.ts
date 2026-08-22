import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allow only specific file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Upload document validation schema
const uploadDocumentSchema = z.object({
  employeeId: z.string(),
  documentType: z.enum([
    'CONTRACT',
    'ID_PROOF',
    'EDUCATION',
    'EXPERIENCE',
    'PAYSLIP',
    'OTHER',
  ]),
  description: z.string().optional(),
});

// Upload document
export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      throw new HttpError(400, 'No file uploaded');
    }

    const validatedData = uploadDocumentSchema.parse(req.body);

    // Check if user is authorized to upload for this employee
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Employees can only upload their own documents
    // HR/Admin can upload for any employee
    if (
      user.role === 'EMPLOYEE' &&
      user.employee?.id !== validatedData.employeeId
    ) {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      throw new HttpError(403, 'You can only upload documents for yourself');
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        employeeId: validatedData.employeeId,
        documentType: validatedData.documentType,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        description: validatedData.description,
        uploadedBy: userId!,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

// Get documents for an employee
export const getEmployeeDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employeeId = req.params.employeeId as string;
    const userId = req.user?.id;

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Employees can only view their own documents
    // HR/Admin can view any employee's documents
    if (user.role === 'EMPLOYEE' && user.employee?.id !== employeeId) {
      throw new HttpError(403, 'You can only view your own documents');
    }

    const documents = await prisma.document.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// Download document
export const downloadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!document) {
      throw new HttpError(404, 'Document not found');
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Employees can only download their own documents
    // HR/Admin can download any document
    if (
      user.role === 'EMPLOYEE' &&
      user.employee?.id !== document.employeeId
    ) {
      throw new HttpError(403, 'You can only download your own documents');
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      throw new HttpError(404, 'File not found on server');
    }

    // Set headers for download
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.fileName}"`
    );

    // Stream file to response
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// Delete document
export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpError(404, 'Document not found');
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // Employees can only delete their own documents
    // HR/Admin can delete any document
    if (
      user.role === 'EMPLOYEE' &&
      user.employee?.id !== document.employeeId
    ) {
      throw new HttpError(403, 'You can only delete your own documents');
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all documents (Admin/HR only)
export const getAllDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentType, employeeId } = req.query;

    const where: any = {};

    if (documentType) {
      where.documentType = documentType as string;
    }

    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            department: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};
