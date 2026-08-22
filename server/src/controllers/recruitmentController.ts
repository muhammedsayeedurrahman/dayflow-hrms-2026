import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, department, description, requirements, salaryRange, openings } = req.body;
    const job = await prisma.jobPosting.create({
      data: {
        title,
        department,
        description,
        requirements,
        salaryRange,
        openings: parseInt(openings) || 1,
        postedBy: req.user?.id || '',
        status: 'OPEN',
      },
    });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, department } = req.query;
    const jobs = await prisma.jobPosting.findMany({
      where: {
        ...(status && { status: status as string }),
        ...(department && { department: department as string }),
      },
      orderBy: { postedAt: 'desc' },
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { stage } = req.query;
    const candidates = await prisma.candidate.findMany({
      where: {
        jobId,
        ...(stage && { stage: stage as string }),
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const { stage, rating, notes } = req.body;
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage, ...(rating && { rating }), ...(notes && { notes }) },
    });
    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};
