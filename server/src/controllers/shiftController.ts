import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId, date, startTime, endTime, department } = req.body;
    const shift = await prisma.shift.create({
      data: { templateId, date: new Date(date), startTime, endTime, department, status: 'OPEN' },
    });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const assignShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    const shift = await prisma.shift.update({
      where: { id },
      data: { employeeId, status: 'ASSIGNED' },
    });
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const getShifts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date, department, employeeId } = req.query;
    const shifts = await prisma.shift.findMany({
      where: {
        ...(date && { date: new Date(date as string) }),
        ...(department && { department: department as string }),
        ...(employeeId && { employeeId: employeeId as string }),
      },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

export const requestSwap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { shiftId, targetEmployeeId, reason } = req.body;
    const request = await prisma.shiftSwapRequest.create({
      data: {
        originalShiftId: shiftId,
        requestorId: req.user?.employeeId || '',
        targetEmployeeId,
        reason,
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
