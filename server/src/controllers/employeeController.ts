import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get current user's profile
export const getMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee profile not found');
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's profile (limited fields)
const updateProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
});

export const updateMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const validatedData = updateProfileSchema.parse(req.body);

    const employee = await prisma.employee.update({
      where: { userId },
      data: validatedData,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: employee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

// Get all employees (Admin/HR only)
export const getAllEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// Get employee by ID (Admin/HR only)
export const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update employee (Admin/HR only)
const updateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  employmentType: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateEmployeeSchema.parse(req.body);

    // Update fullName if firstName or lastName changed
    const updateData: any = { ...validatedData };
    if (validatedData.firstName || validatedData.lastName) {
      const employee = await prisma.employee.findUnique({ where: { id } });
      if (employee) {
        const firstName = validatedData.firstName || employee.firstName;
        const lastName = validatedData.lastName || employee.lastName;
        updateData.fullName = `${firstName} ${lastName}`.trim();
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};
