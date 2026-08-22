import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Input validation schema
const chatbotQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(1000, 'Query too long'),
  userId: z.string().optional(), // Optional: defaults to authenticated user
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Confidence level type
type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Determine confidence level based on query type and available context
 */
function determineConfidence(
  query: string,
  hasEmployeeData: boolean,
  responseLength: number
): ConfidenceLevel {
  const lowerQuery = query.toLowerCase();

  // High confidence for queries with complete employee data
  if (hasEmployeeData) {
    if (
      lowerQuery.includes('leave') ||
      lowerQuery.includes('attendance') ||
      lowerQuery.includes('salary') ||
      lowerQuery.includes('payroll')
    ) {
      return 'high';
    }
  }

  // Medium confidence for general policy questions
  if (
    lowerQuery.includes('policy') ||
    lowerQuery.includes('hours') ||
    lowerQuery.includes('holiday')
  ) {
    return 'medium';
  }

  // Low confidence for vague queries or very short responses
  if (responseLength < 50 || lowerQuery.split(' ').length < 3) {
    return 'low';
  }

  return 'medium';
}

/**
 * Calculate total leave days used by type
 */
function calculateLeaveUsage(
  leaveRequests: Array<{ leaveType: string; totalDays: number; status: string }>
): { paid: number; sick: number; unpaid: number } {
  return leaveRequests
    .filter((leave) => leave.status === 'APPROVED')
    .reduce(
      (acc, leave) => {
        if (leave.leaveType === 'PAID') acc.paid += leave.totalDays;
        else if (leave.leaveType === 'SICK') acc.sick += leave.totalDays;
        else if (leave.leaveType === 'UNPAID') acc.unpaid += leave.totalDays;
        return acc;
      },
      { paid: 0, sick: 0, unpaid: 0 }
    );
}

/**
 * Handle chatbot query
 * POST /api/chatbot/query
 */
export const handleChatbotQuery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new HttpError(
        503,
        'Chatbot service is unavailable. Please contact your administrator.'
      );
    }

    // Validate input
    const validatedData = chatbotQuerySchema.parse(req.body);
    const userId = validatedData.userId || req.user?.id;

    if (!userId) {
      throw new HttpError(400, 'User ID is required');
    }

    // Get employee context
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        leaveRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        attendance: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        payroll: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new HttpError(404, 'Employee not found');
    }

    // Calculate leave usage (since schema doesn't have leave balance fields)
    const leaveUsage = calculateLeaveUsage(employee.leaveRequests);
    const paidLeaveRemaining = Math.max(0, 12 - leaveUsage.paid); // Assuming 12 days annual quota
    const sickLeaveRemaining = Math.max(0, 7 - leaveUsage.sick); // Assuming 7 days annual quota

    // Calculate attendance stats
    const totalAttendanceDays = employee.attendance.length;
    const presentDays = employee.attendance.filter(
      (a) => a.status === 'PRESENT'
    ).length;
    const absentDays = employee.attendance.filter(
      (a) => a.status === 'ABSENT'
    ).length;

    // Build comprehensive context for Claude
    const context = `
You are an HR assistant chatbot for Dayflow HRMS. Answer employee questions helpfully and concisely.

EMPLOYEE INFORMATION:
Name: ${employee.fullName}
Department: ${employee.department || 'Not assigned'}
Designation: ${employee.designation || 'Not assigned'}
Employment Type: ${employee.employmentType || 'Full-time'}
Joining Date: ${employee.joiningDate.toLocaleDateString('en-IN')}

LEAVE INFORMATION:
- Paid Leave Used: ${leaveUsage.paid} days (${paidLeaveRemaining} remaining out of 12 annual)
- Sick Leave Used: ${leaveUsage.sick} days (${sickLeaveRemaining} remaining out of 7 annual)
- Unpaid Leave Used: ${leaveUsage.unpaid} days
- Recent Leave Requests: ${employee.leaveRequests.length} in history
- Pending Requests: ${employee.leaveRequests.filter((l) => l.status === 'PENDING').length}

ATTENDANCE INFORMATION:
- Total Days Tracked: ${totalAttendanceDays} days
- Present: ${presentDays} days
- Absent: ${absentDays} days
- Recent Attendance: Last ${Math.min(30, totalAttendanceDays)} days tracked

SALARY INFORMATION:
${
  employee.payroll
    ? `- Basic Salary: ₹${employee.payroll.basicSalary.toLocaleString('en-IN')}
- Gross Salary: ₹${employee.payroll.grossSalary.toLocaleString('en-IN')}
- Net Salary: ₹${employee.payroll.netSalary.toLocaleString('en-IN')}`
    : '- Payroll information not available'
}

COMPANY POLICIES:
- Paid Leave: 12 days per year (requires manager approval)
- Sick Leave: 7 days per year (medical certificate required for >2 consecutive days)
- Casual Leave: Requires 1-day advance notice
- Work Hours: 9:00 AM - 6:00 PM (Monday to Friday)
- Weekend: Saturday and Sunday
- Notice Period: 30 days for resignation

USER QUERY:
${validatedData.query}

INSTRUCTIONS:
1. Answer the query directly and concisely (2-4 sentences maximum)
2. Use the employee's specific data when relevant
3. If you don't have enough information, say "I don't have that information. Please contact HR at hr@dayflow.com or call ext. 100."
4. Be professional, friendly, and helpful
5. Do not make up information - only use the context provided
6. Format numbers in Indian style (₹ for currency, commas for thousands)
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{ role: 'user', content: context }],
    });

    // Extract response text
    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Determine confidence level
    const confidence = determineConfidence(
      validatedData.query,
      !!employee,
      responseText.length
    );

    res.json({
      success: true,
      data: {
        response: responseText,
        confidence,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(400, 'Validation error', error.errors));
    } else if (error instanceof Anthropic.APIError) {
      // Handle Anthropic API errors
      console.error('Anthropic API Error:', error);
      next(
        new HttpError(
          503,
          'Failed to process your query. Please try again later.'
        )
      );
    } else {
      next(error);
    }
  }
};

/**
 * Get chatbot status/health check
 * GET /api/chatbot/status
 */
export const getChatbotStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const isConfigured = !!process.env.ANTHROPIC_API_KEY;

    res.json({
      success: true,
      data: {
        available: isConfigured,
        model: 'claude-sonnet-4-5-20250929',
        status: isConfigured ? 'operational' : 'not_configured',
        message: isConfigured
          ? 'Chatbot is ready to assist you'
          : 'Chatbot is not configured. Please set ANTHROPIC_API_KEY.',
      },
    });
  } catch (error) {
    next(error);
  }
};
