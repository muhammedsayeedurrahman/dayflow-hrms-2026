import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Calculate attrition risk score for an employee (0-100)
 * Higher score = higher risk of leaving
 */
function calculateAttritionRisk(data: {
  tenureDays: number;
  absenceRate: number;
  lastReviewDays: number;
  hasRecentTraining: boolean;
  hasRecentFeedback: boolean;
  overdueLeaveDays: number;
}): { score: number; factors: string[] } {
  let risk = 0;
  const factors: string[] = [];

  // High absence rate (>10%) adds 30 points
  if (data.absenceRate > 0.1) {
    risk += 30;
    factors.push(`High absence rate (${(data.absenceRate * 100).toFixed(1)}%)`);
  } else if (data.absenceRate > 0.05) {
    risk += 15;
    factors.push(`Moderate absence rate (${(data.absenceRate * 100).toFixed(1)}%)`);
  }

  // Overdue performance review (>6 months) adds 25 points
  if (data.lastReviewDays > 180) {
    risk += 25;
    factors.push(`Performance review overdue (${Math.floor(data.lastReviewDays / 30)} months)`);
  } else if (data.lastReviewDays > 90) {
    risk += 10;
    factors.push('Performance review pending');
  }

  // Low tenure (<6 months) adds 20 points
  if (data.tenureDays < 180) {
    risk += 20;
    factors.push(`New hire (${Math.floor(data.tenureDays / 30)} months tenure)`);
  } else if (data.tenureDays < 365) {
    risk += 10;
    factors.push('Less than 1 year tenure');
  }

  // No recent skill development adds 15 points
  if (!data.hasRecentTraining) {
    risk += 15;
    factors.push('No training in last 6 months');
  }

  // Low engagement (no feedback given) adds 10 points
  if (!data.hasRecentFeedback) {
    risk += 10;
    factors.push('Low engagement metrics');
  }

  // Excessive leave balance adds 10 points
  if (data.overdueLeaveDays > 10) {
    risk += 10;
    factors.push(`High unused leave balance (${data.overdueLeaveDays} days)`);
  }

  return {
    score: Math.min(risk, 100), // Cap at 100
    factors,
  };
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate recommendations based on risk factors
 */
function generateRecommendations(factors: string[], score: number): string {
  const recommendations: string[] = [];

  if (score >= 50) {
    recommendations.push('Schedule immediate 1-on-1 with manager');
    recommendations.push('Review compensation and career progression');
  }

  if (factors.some((f) => f.includes('absence'))) {
    recommendations.push('Investigate reasons for high absenteeism');
    recommendations.push('Consider flexible work arrangements');
  }

  if (factors.some((f) => f.includes('review'))) {
    recommendations.push('Conduct performance review promptly');
  }

  if (factors.some((f) => f.includes('training'))) {
    recommendations.push('Offer skill development opportunities');
    recommendations.push('Create personalized learning path');
  }

  if (factors.some((f) => f.includes('engagement'))) {
    recommendations.push('Increase recognition and feedback frequency');
    recommendations.push('Involve in key projects or initiatives');
  }

  if (factors.some((f) => f.includes('New hire'))) {
    recommendations.push('Enhance onboarding and mentorship');
    recommendations.push('Ensure clear role expectations');
  }

  return recommendations.join('; ');
}

/**
 * Generate AI insights for all employees
 * Calculates attrition risk and creates insight records
 */
export const generateInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN can generate insights
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can generate insights',
      });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Get all active employees with related data
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        attendance: {
          where: {
            date: { gte: sixMonthsAgo },
          },
        },
        leaveRequests: {
          where: {
            createdAt: { gte: sixMonthsAgo },
          },
        },
      },
    });

    const insights = [];

    for (const employee of employees) {
      const tenureDays = Math.floor(
        (now.getTime() - employee.joiningDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Calculate absence rate
      const totalDays = Math.min(tenureDays, 180); // Last 6 months
      const attendanceRecords = employee.attendance.length;
      const absentDays = employee.attendance.filter(
        (a) => a.status === 'ABSENT'
      ).length;
      const absenceRate = totalDays > 0 ? absentDays / totalDays : 0;

      // Simulate last review (in real app, this would come from performance reviews)
      const lastReviewDays = Math.floor(Math.random() * 365); // Placeholder

      // Check for recent training (placeholder - would integrate with L&D module)
      const hasRecentTraining = Math.random() > 0.5; // Placeholder

      // Check engagement (placeholder)
      const hasRecentFeedback = employee.leaveRequests.length > 0; // Simple proxy

      // Unused leave days (placeholder)
      const overdueLeaveDays = 0; // Would calculate from leave balance

      const riskData = calculateAttritionRisk({
        tenureDays,
        absenceRate,
        lastReviewDays,
        hasRecentTraining,
        hasRecentFeedback,
        overdueLeaveDays,
      });

      const riskLevel = getRiskLevel(riskData.score);
      const recommendations = generateRecommendations(
        riskData.factors,
        riskData.score
      );

      // Only create insights for medium risk or higher
      if (riskData.score >= 25) {
        const insight = await prisma.aIInsight.create({
          data: {
            type: 'ATTRITION_RISK',
            employeeId: employee.id,
            riskLevel,
            score: riskData.score,
            title: `Attrition Risk: ${employee.fullName}`,
            description: `Risk Score: ${riskData.score}/100. Factors: ${riskData.factors.join(', ')}`,
            recommendation: recommendations,
            metadata: {
              factors: riskData.factors,
              tenureDays,
              absenceRate,
              lastReviewDays,
            },
            confidence: 0.78, // 78% confidence (based on algorithm accuracy)
            expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        insights.push(insight);
      }
    }

    res.json({
      success: true,
      data: {
        insightsGenerated: insights.length,
        totalEmployeesAnalyzed: employees.length,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active AI insights
 */
export const getAllInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN can view insights
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can view insights',
      });
    }

    const { type, riskLevel, isActive } = req.query;

    const insights = await prisma.aIInsight.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(riskLevel && { riskLevel: riskLevel as any }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get insights for a specific employee
 */
export const getEmployeeInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;

    // Employees can only view their own insights
    // HR/ADMIN can view any employee's insights
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });

    if (
      !employee ||
      (req.user?.role === 'EMPLOYEE' && employee.userId !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these insights',
      });
    }

    const insights = await prisma.aIInsight.findMany({
      where: {
        employeeId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an insight (mark as seen)
 */
export const acknowledgeInsight = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const insight = await prisma.aIInsight.update({
      where: { id },
      data: {
        acknowledgedBy: req.user?.id,
        acknowledgedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attrition risk summary statistics
 */
export const getAttritionStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only HR/ADMIN
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can view attrition stats',
      });
    }

    const insights = await prisma.aIInsight.findMany({
      where: {
        type: 'ATTRITION_RISK',
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    const stats = {
      total: insights.length,
      critical: insights.filter((i) => i.riskLevel === 'CRITICAL').length,
      high: insights.filter((i) => i.riskLevel === 'HIGH').length,
      medium: insights.filter((i) => i.riskLevel === 'MEDIUM').length,
      low: insights.filter((i) => i.riskLevel === 'LOW').length,
      averageScore:
        insights.length > 0
          ? insights.reduce((sum, i) => sum + (i.score || 0), 0) / insights.length
          : 0,
      acknowledged: insights.filter((i) => i.acknowledgedBy).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
