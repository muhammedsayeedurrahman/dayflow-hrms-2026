import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { department, role, tasks, documents } = req.body;
    const template = await prisma.onboardingTemplate.create({
      data: { department, role, tasks, documents },
    });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const startJourney = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, templateId } = req.body;
    let tasks = [];

    if (templateId) {
      const template = await prisma.onboardingTemplate.findUnique({ where: { id: templateId } });
      tasks = template?.tasks as any || [];
    }

    const journey = await prisma.onboardingJourney.create({
      data: {
        employeeId,
        templateId,
        startDate: new Date(),
        tasks,
        status: 'ACTIVE',
      },
    });
    res.status(201).json({ success: true, data: journey });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { journeyId, taskIndex } = req.params;
    const { completed } = req.body;

    const journey = await prisma.onboardingJourney.findUnique({ where: { id: journeyId } });
    if (!journey) {
      return res.status(404).json({ success: false, error: 'Journey not found' });
    }

    const tasks = journey.tasks as any[];
    if (tasks[parseInt(taskIndex)]) {
      tasks[parseInt(taskIndex)].completed = completed;
      tasks[parseInt(taskIndex)].completedAt = completed ? new Date() : null;
    }

    const completedCount = tasks.filter((t: any) => t.completed).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    const updated = await prisma.onboardingJourney.update({
      where: { id: journeyId },
      data: {
        tasks,
        progress,
        ...(progress === 100 && { status: 'COMPLETED', completedAt: new Date() }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getJourney = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const journey = await prisma.onboardingJourney.findFirst({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: journey });
  } catch (error) {
    next(error);
  }
};

export const getAllJourneys = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const journeys = await prisma.onboardingJourney.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: journeys });
  } catch (error) {
    next(error);
  }
};
