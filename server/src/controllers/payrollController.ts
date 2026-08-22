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
    const employeeId = req.params.employeeId as string;
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

// Get payroll statistics (Admin/HR only)
export const getPayrollStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: {
          select: {
            department: true,
            designation: true,
          },
        },
      },
    });

    // Calculate totals
    const totalGrossSalary = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalBasicSalary = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
    const totalDeductions = payrolls.reduce(
      (sum, p) => sum + ((p.providentFund || 0) + (p.tax || 0) + (p.otherDeductions || 0)),
      0
    );

    // Group by department
    const departmentMap = payrolls.reduce((acc, payroll) => {
      const dept = payroll.employee.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          grossSalary: 0,
          netSalary: 0,
          count: 0,
        };
      }
      acc[dept].grossSalary += payroll.grossSalary;
      acc[dept].netSalary += payroll.netSalary;
      acc[dept].count++;
      return acc;
    }, {} as Record<string, any>);

    const byDepartment = Object.values(departmentMap);

    // Group by designation
    const designationMap = payrolls.reduce((acc, payroll) => {
      const designation = payroll.employee.designation || 'Unassigned';
      if (!acc[designation]) {
        acc[designation] = {
          designation,
          averageGross: 0,
          averageNet: 0,
          count: 0,
        };
      }
      acc[designation].averageGross += payroll.grossSalary;
      acc[designation].averageNet += payroll.netSalary;
      acc[designation].count++;
      return acc;
    }, {} as Record<string, any>);

    const byDesignation = Object.values(designationMap).map((item: any) => ({
      designation: item.designation,
      averageGross: Math.round(item.averageGross / item.count),
      averageNet: Math.round(item.averageNet / item.count),
      count: item.count,
    }));

    res.json({
      success: true,
      data: {
        totalGrossSalary,
        totalNetSalary,
        totalBasicSalary,
        totalDeductions,
        averageGrossSalary: payrolls.length > 0 ? Math.round(totalGrossSalary / payrolls.length) : 0,
        averageNetSalary: payrolls.length > 0 ? Math.round(totalNetSalary / payrolls.length) : 0,
        employeeCount: payrolls.length,
        byDepartment,
        byDesignation,
      },
    });
  } catch (error) {
    next(error);
  }
};
