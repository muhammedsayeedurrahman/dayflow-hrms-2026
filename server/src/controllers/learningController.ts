import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, duration, mandatory, department } = req.body;
    const course = await prisma.course.create({
      data: { title, description, type, duration: parseInt(duration), mandatory, department },
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, mandatory } = req.query;
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        ...(type && { type: type as string }),
        ...(mandatory !== undefined && { mandatory: mandatory === 'true' }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const enrollEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId, employeeId } = req.body;
    const enrollment = await prisma.employeeCourse.create({
      data: {
        employeeId,
        courseId,
        assignedBy: req.user?.id,
        status: 'ASSIGNED',
      },
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;

    // Check if enrollment exists and hasn't started yet
    const existing = await prisma.employeeCourse.findUnique({
      where: { id: enrollmentId },
    });

    const enrollment = await prisma.employeeCourse.update({
      where: { id: enrollmentId },
      data: {
        progress: parseInt(progress),
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        ...(progress >= 100 && { completedAt: new Date() }),
        ...(!existing?.startedAt && { startedAt: new Date() }),
      },
    });
    res.json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const getMyCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const courses = await prisma.employeeCourse.findMany({
      where: { employeeId: req.user?.employeeId },
      orderBy: { assignedAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};
