import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const submitClaim = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, amount, description, receiptUrl, date } = req.body;
    const claim = await prisma.expenseClaim.create({
      data: {
        employeeId: req.user?.employeeId || '',
        category,
        amount: parseFloat(amount),
        description,
        receiptUrl,
        date: new Date(date),
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

export const getAllClaims = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, employeeId } = req.query;
    const claims = await prisma.expenseClaim.findMany({
      where: {
        ...(status && { status: status as string }),
        ...(employeeId && { employeeId: employeeId as string }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

export const approveClaim = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const claim = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user?.id,
        approvedAt: new Date(),
      },
    });
    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

export const rejectClaim = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const claim = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: req.user?.id,
        approvedAt: new Date(),
      },
    });
    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};
