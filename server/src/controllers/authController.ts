import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { HttpError } from '../middleware/errorHandler';

// Validation schemas
const signUpSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = signUpSchema.parse(req.body);

    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.password);
    if (!passwordValidation.valid) {
      throw new HttpError(400, 'Password does not meet security requirements', passwordValidation.errors);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { employeeId: validatedData.employeeId },
        ],
      },
    });

    if (existingUser) {
      throw new HttpError(409, 'User with this email or employee ID already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const user = await tx.user.create({
        data: {
          employeeId: validatedData.employeeId,
          email: validatedData.email,
          password: hashedPassword,
          // Privileged roles are provisioned by an authorized administrator,
          // never selected from an unauthenticated public request.
          role: 'EMPLOYEE',
        },
      });

      // Create employee profile
      const fullName = validatedData.firstName && validatedData.lastName
        ? `${validatedData.firstName} ${validatedData.lastName}`
        : validatedData.email.split('@')[0];

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          firstName: validatedData.firstName || fullName,
          lastName: validatedData.lastName || '',
          fullName,
        },
      });

      return { user, employee };
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now sign in.',
      data: {
        userId: result.user.id,
        employeeId: result.user.employeeId,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = signInSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    // Check if employee profile exists
    if (!user.employee) {
      throw new HttpError(500, 'Employee profile not found');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        details: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          fullName: user.employee.fullName,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          designation: user.employee.designation,
          department: user.employee.department,
          profilePicture: user.employee.profilePicture,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else {
      next(error);
    }
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User is already attached to req by auth middleware
    const authReq = req as any;
    const userId = authReq.user?.id;

    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!user || !user.employee) {
      throw new HttpError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          fullName: user.employee.fullName,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          designation: user.employee.designation,
          department: user.employee.department,
          profilePicture: user.employee.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
