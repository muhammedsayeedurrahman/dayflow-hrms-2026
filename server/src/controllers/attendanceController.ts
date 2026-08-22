import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Check in
export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      throw new HttpError(400, 'Already checked in today');
    }

    const checkInTime = new Date();

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      create: {
        employeeId: employee.id,
        date: today,
        checkInTime,
        status: 'PRESENT',
      },
      update: {
        checkInTime,
        status: 'PRESENT',
      },
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Check out
export const checkOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.checkInTime) {
      throw new HttpError(400, 'Please check in first');
    }

    if (attendance.checkOutTime) {
      throw new HttpError(400, 'Already checked out today');
    }

    const checkOutTime = new Date();
    const workHours =
      (checkOutTime.getTime() - attendance.checkInTime.getTime()) /
      (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        workHours,
      },
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Get my attendance
export const getMyAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    const where: any = { employeeId: employee.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get all attendance (Admin/HR)
export const getAllAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's status
export const getTodayStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    res.json({
      success: true,
      data: attendance || null,
    });
  } catch (error) {
    next(error);
  }
};
