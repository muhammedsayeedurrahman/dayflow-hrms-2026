import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, code, department, description, startDate, endDate } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        code,
        department,
        description,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.query;
    const projects = await prisma.project.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const logTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, taskDescription, date, hours, billable } = req.body;
    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: req.user?.employeeId || '',
        projectId,
        taskDescription,
        date: new Date(date),
        hours: parseFloat(hours),
        billable: billable !== false,
      },
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

export const getMyTimeEntries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const entries = await prisma.timeEntry.findMany({
      where: {
        employeeId: req.user?.employeeId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }),
      },
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

export const approveTimeEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        approved: true,
        approvedBy: req.user?.id,
        approvedAt: new Date(),
      },
    });
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};
