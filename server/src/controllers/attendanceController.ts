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

// Get attendance statistics (Admin/HR only)
export const getAttendanceStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no date range provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get attendance records for date range
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        employee: {
          select: {
            fullName: true,
            department: true,
          },
        },
      },
    });

    // Aggregate by status
    const summary = {
      present: attendanceRecords.filter((a) => a.status === 'PRESENT').length,
      absent: attendanceRecords.filter((a) => a.status === 'ABSENT').length,
      halfDay: attendanceRecords.filter((a) => a.status === 'HALF_DAY').length,
      leave: attendanceRecords.filter((a) => a.status === 'LEAVE').length,
      total: attendanceRecords.length,
    };

    // Group by date for trend chart
    const trendMap = attendanceRecords.reduce((acc, record) => {
      const date = record.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, halfDay: 0, leave: 0 };
      }
      if (record.status === 'PRESENT') acc[date].present++;
      if (record.status === 'ABSENT') acc[date].absent++;
      if (record.status === 'HALF_DAY') acc[date].halfDay++;
      if (record.status === 'LEAVE') acc[date].leave++;
      return acc;
    }, {} as Record<string, any>);

    const trends = Object.values(trendMap).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    // Group by department
    const departmentMap = attendanceRecords.reduce((acc, record) => {
      const dept = record.employee.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { department: dept, present: 0, absent: 0, halfDay: 0, leave: 0 };
      }
      if (record.status === 'PRESENT') acc[dept].present++;
      if (record.status === 'ABSENT') acc[dept].absent++;
      if (record.status === 'HALF_DAY') acc[dept].halfDay++;
      if (record.status === 'LEAVE') acc[dept].leave++;
      return acc;
    }, {} as Record<string, any>);

    const byDepartment = Object.values(departmentMap);

    res.json({
      success: true,
      data: {
        summary,
        trends,
        byDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};
