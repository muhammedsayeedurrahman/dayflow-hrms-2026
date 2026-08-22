import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a new skill in the catalog
 * HR/ADMIN only
 */
export const createSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN can create skills
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can create skills',
      });
    }

    const { name, category, description, department } = req.body;

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        description,
        department,
      },
    });

    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all skills from catalog
 */
export const getAllSkills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, department, isActive } = req.query;

    const skills = await prisma.skill.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(department && { department: department as string }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee skills (add/update proficiency)
 */
export const updateEmployeeSkills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;
    const { skills } = req.body; // [{skillId, level, notes}]

    // Get employee to check authorization
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Employees can update their own skills, HR/ADMIN can update anyone's
    const isOwn = employee.userId === req.user?.id;
    const isHR = req.user?.role === 'HR' || req.user?.role === 'ADMIN';

    if (!isOwn && !isHR) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update these skills',
      });
    }

    const upsertPromises = skills.map((skill: any) =>
      prisma.employeeSkill.upsert({
        where: {
          employeeId_skillId: {
            employeeId,
            skillId: skill.skillId,
          },
        },
        update: {
          level: skill.level,
          notes: skill.notes,
          lastAssessed: new Date(),
          ...(isHR && {
            verified: true,
            verifiedBy: req.user?.id,
            verifiedAt: new Date(),
          }),
        },
        create: {
          employeeId,
          skillId: skill.skillId,
          level: skill.level,
          notes: skill.notes,
          ...(isHR && {
            verified: true,
            verifiedBy: req.user?.id,
            verifiedAt: new Date(),
          }),
        },
      })
    );

    const updatedSkills = await Promise.all(upsertPromises);

    res.json({
      success: true,
      data: updatedSkills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee skills with skill details
 */
export const getEmployeeSkills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;

    const employeeSkills = await prisma.employeeSkill.findMany({
      where: { employeeId },
      include: {
        skill: true,
      },
      orderBy: [{ level: 'desc' }, { lastAssessed: 'desc' }],
    });

    res.json({
      success: true,
      data: employeeSkills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get skills matrix for a department or entire company
 * Returns heat map data: employees x skills with proficiency levels
 */
export const getSkillsMatrix = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN can view skills matrix
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can view skills matrix',
      });
    }

    const { department } = req.query;

    // Get employees (optionally filtered by department)
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        ...(department && { department: department as string }),
      },
      select: {
        id: true,
        fullName: true,
        designation: true,
        department: true,
      },
    });

    // Get all skills
    const skills = await prisma.skill.findMany({
      where: {
        isActive: true,
        ...(department && { department: department as string }),
      },
      orderBy: { name: 'asc' },
    });

    // Get all employee skills
    const employeeSkills = await prisma.employeeSkill.findMany({
      where: {
        employeeId: { in: employees.map((e) => e.id) },
      },
      include: {
        skill: true,
      },
    });

    // Build matrix: { employeeId: { skillId: level } }
    const matrix = employees.map((employee) => {
      const skillLevels: { [skillId: string]: number } = {};

      skills.forEach((skill) => {
        const empSkill = employeeSkills.find(
          (es) => es.employeeId === employee.id && es.skillId === skill.id
        );
        skillLevels[skill.id] = empSkill?.level || 0;
      });

      return {
        employee: {
          id: employee.id,
          name: employee.fullName,
          designation: employee.designation,
          department: employee.department,
        },
        skills: skillLevels,
      };
    });

    res.json({
      success: true,
      data: {
        skills: skills.map((s) => ({ id: s.id, name: s.name, category: s.category })),
        matrix,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Identify skill gaps for an employee based on target role
 */
export const analyzeSkillGaps = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;
    const { roleTitle, requiredSkills } = req.body; // requiredSkills: [{skillId, requiredLevel}]

    // Get employee's current skills
    const employeeSkills = await prisma.employeeSkill.findMany({
      where: { employeeId },
      include: { skill: true },
    });

    const missingSkills: any[] = [];
    let totalGap = 0;

    requiredSkills.forEach((required: any) => {
      const current = employeeSkills.find((es) => es.skillId === required.skillId);
      const currentLevel = current?.level || 0;
      const gap = required.requiredLevel - currentLevel;

      if (gap > 0) {
        totalGap += gap;
        missingSkills.push({
          skillId: required.skillId,
          skillName: current?.skill.name || 'Unknown',
          requiredLevel: required.requiredLevel,
          currentLevel,
          gap,
        });
      }
    });

    // Determine priority
    const priority =
      totalGap >= 10 ? 'HIGH' : totalGap >= 5 ? 'MEDIUM' : 'LOW';

    // Create skill gap record
    const skillGap = await prisma.skillGap.create({
      data: {
        employeeId,
        roleTitle,
        missingSkills,
        priority,
        status: 'IDENTIFIED',
      },
    });

    res.json({
      success: true,
      data: skillGap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get skills statistics
 */
export const getSkillsStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can view skills stats',
      });
    }

    const [
      totalSkills,
      totalEmployeeSkills,
      verifiedSkills,
      skillsByCategory,
    ] = await Promise.all([
      prisma.skill.count({ where: { isActive: true } }),
      prisma.employeeSkill.count(),
      prisma.employeeSkill.count({ where: { verified: true } }),
      prisma.skill.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    // Average proficiency level
    const avgLevel = await prisma.employeeSkill.aggregate({
      _avg: { level: true },
    });

    const stats = {
      totalSkills,
      totalEmployeeSkills,
      verifiedSkills,
      averageProficiency: avgLevel._avg.level || 0,
      skillsByCategory: skillsByCategory.map((cat) => ({
        category: cat.category,
        count: cat._count,
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
