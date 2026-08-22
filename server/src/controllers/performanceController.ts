import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a performance goal (OKR)
 */
export const createGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, type, quarter, objective, keyResults, startDate, endDate } = req.body;

    const goal = await prisma.performanceGoal.create({
      data: {
        employeeId,
        type,
        quarter,
        objective,
        keyResults,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: req.user?.id || '',
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all goals with filters
 */
export const getAllGoals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, quarter, status } = req.query;

    const goals = await prisma.performanceGoal.findMany({
      where: {
        ...(employeeId && { employeeId: employeeId as string }),
        ...(quarter && { quarter: quarter as string }),
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

/**
 * Update goal progress
 */
export const updateGoalProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { progress, keyResults } = req.body;

    const goal = await prisma.performanceGoal.update({
      where: { id },
      data: {
        progress,
        keyResults,
        ...(progress === 100 && { status: 'COMPLETED' }),
      },
    });

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

/**
 * Create 360 feedback request
 */
export const createFeedbackRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectId, reviewers, questions, anonymousMode, dueDate } = req.body;

    const request = await prisma.feedbackRequest.create({
      data: {
        subjectId,
        requestorId: req.user?.id || '',
        reviewers,
        questions,
        anonymousMode: anonymousMode !== false,
        dueDate: new Date(dueDate),
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit feedback response
 */
export const submitFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { requestId } = req.params;
    const { answers } = req.body;

    const response = await prisma.feedbackResponse.create({
      data: {
        requestId,
        reviewerId: req.user?.id || '',
        answers,
      },
    });

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback requests
 */
export const getFeedbackRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    const requests = await prisma.feedbackRequest.findMany({
      where: {
        ...(status && { status: status as any }),
        OR: [
          { requestorId: req.user?.id },
          { subjectId: req.user?.employeeId },
        ],
      },
      include: { responses: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};
