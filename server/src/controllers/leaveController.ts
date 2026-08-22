import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const applyLeaveSchema = z.object({
  leaveType: z.enum(['PAID', 'SICK', 'UNPAID']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
});

// Apply for leave
export const applyLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const validatedData = applyLeaveSchema.parse(req.body);

    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new HttpError(400, 'Invalid date range');
    }

    // Calculate total days
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      throw new HttpError(400, 'Invalid date range');
    }

    const hrUsers = await prisma.user.findMany({
      where: { role: { in: ['HR', 'ADMIN'] } },
      select: { id: true },
    });

    // The request and every recipient notification are one business action.
    const leaveRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveType: validatedData.leaveType,
          startDate,
          endDate,
          totalDays,
          reason: validatedData.reason,
          remarks: validatedData.remarks,
          status: 'PENDING',
        },
      });

      if (hrUsers.length > 0) {
        await tx.notification.createMany({
          data: hrUsers.map((hrUser) => ({
            userId: hrUser.id,
            type: 'LEAVE_SUBMITTED',
            title: 'New Leave Request',
            message: `${employee.fullName} has submitted a ${validatedData.leaveType.toLowerCase()} leave request for ${totalDays} day(s)`,
            metadata: {
              leaveRequestId: created.id,
              employeeId: employee.id,
            },
          })),
        });
      }

      return created;
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

// Get my leaves
export const getMyLeaves = async (
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

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// Get all leaves (Admin/HR)
export const getAllLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, employeeId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const leaves = await prisma.leaveRequest.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

// Update leave status (Admin/HR)
export const updateLeaveStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const validatedData = updateLeaveStatusSchema.parse(req.body);

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new HttpError(404, 'Leave request not found');
    }

    if (leaveRequest.status !== 'PENDING') {
      throw new HttpError(400, 'Leave request has already been processed');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const processed = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: validatedData.status,
          reviewedBy: userId,
          reviewedAt: new Date(),
          reviewComments: validatedData.comments,
        },
      });

      if (leaveRequest.employee.user) {
        await tx.notification.create({
          data: {
            userId: leaveRequest.employee.user.id,
            type:
              validatedData.status === 'APPROVED'
                ? 'LEAVE_APPROVED'
                : 'LEAVE_REJECTED',
            title: `Leave ${validatedData.status.toLowerCase()}`,
            message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request has been ${validatedData.status.toLowerCase()}${validatedData.comments ? `: ${validatedData.comments}` : ''}`,
            metadata: { leaveRequestId: leaveRequest.id },
          },
        });
      }

      return processed;
    });

    res.json({
      success: true,
      message: `Leave request ${validatedData.status.toLowerCase()} successfully`,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

// Get leave statistics (Admin/HR only)
export const getLeaveStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        employee: {
          select: {
            department: true,
          },
        },
      },
    });

    // Group by type
    const byType = {
      PAID: leaves.filter((l) => l.leaveType === 'PAID').length,
      SICK: leaves.filter((l) => l.leaveType === 'SICK').length,
      UNPAID: leaves.filter((l) => l.leaveType === 'UNPAID').length,
    };

    // Group by status
    const byStatus = {
      PENDING: leaves.filter((l) => l.status === 'PENDING').length,
      APPROVED: leaves.filter((l) => l.status === 'APPROVED').length,
      REJECTED: leaves.filter((l) => l.status === 'REJECTED').length,
    };

    // Group by department
    const departmentMap = leaves.reduce((acc, leave) => {
      const dept = leave.employee.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDepartment = Object.entries(departmentMap).map(([department, count]) => ({
      department,
      count,
    }));

    // Calculate total days requested
    const totalDaysRequested = leaves.reduce((sum, leave) => {
      return sum + leave.totalDays;
    }, 0);

    res.json({
      success: true,
      data: {
        byType,
        byStatus,
        byDepartment,
        totalLeaves: leaves.length,
        totalDaysRequested,
      },
    });
  } catch (error) {
    next(error);
  }
};
