import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get my payroll
export const getMyPayroll = async (
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

    const payroll = await prisma.payroll.findUnique({
      where: { employeeId: employee.id },
    });

    res.json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// Get all payroll (Admin/HR)
export const getAllPayroll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payrolls = await prisma.payroll.findMany({
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
    });

    res.json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    next(error);
  }
};

const updatePayrollSchema = z.object({
  basicSalary: z.number().positive(),
  hra: z.number().optional(),
  transportAllowance: z.number().optional(),
  medicalAllowance: z.number().optional(),
  otherAllowances: z.number().optional(),
  providentFund: z.number().optional(),
  tax: z.number().optional(),
  otherDeductions: z.number().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

// Update payroll (Admin/HR)
export const updatePayroll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;
    const validatedData = updatePayrollSchema.parse(req.body);

    const {
      basicSalary,
      hra = 0,
      transportAllowance = 0,
      medicalAllowance = 0,
      otherAllowances = 0,
      providentFund = 0,
      tax = 0,
      otherDeductions = 0,
    } = validatedData;

    const grossSalary =
      basicSalary + hra + transportAllowance + medicalAllowance + otherAllowances;
    const netSalary = grossSalary - providentFund - tax - otherDeductions;

    const payroll = await prisma.payroll.upsert({
      where: { employeeId },
      create: {
        employeeId,
        ...validatedData,
        grossSalary,
        netSalary,
      },
      update: {
        ...validatedData,
        grossSalary,
        netSalary,
      },
    });

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};
