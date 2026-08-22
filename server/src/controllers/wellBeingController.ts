import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createProgram = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, description, startDate, endDate } = req.body;
    const program = await prisma.wellnessProgram.create({
      data: {
        name,
        type,
        description,
        startDate: new Date(startDate),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

export const getAllPrograms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, isActive } = req.query;
    const programs = await prisma.wellnessProgram.findMany({
      where: {
        ...(type && { type: type as string }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const logActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { programId, activityType, activityDate, points, notes } = req.body;
    const activity = await prisma.wellnessActivity.create({
      data: {
        employeeId: req.user?.employeeId || '',
        programId,
        activityType,
        activityDate: new Date(activityDate),
        points: parseInt(points) || 0,
        notes,
      },
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const getMyActivities = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activities = await prisma.wellnessActivity.findMany({
      where: { employeeId: req.user?.employeeId },
      orderBy: { activityDate: 'desc' },
    });
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};
