import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import Anthropic from '@anthropic-ai/sdk';

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, department, description, requirements, salaryRange, openings } = req.body;
    const job = await prisma.jobPosting.create({
      data: {
        title,
        department,
        description,
        requirements,
        salaryRange,
        openings: parseInt(openings) || 1,
        postedBy: req.user?.id || '',
        status: 'OPEN',
      },
    });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, department } = req.query;
    const jobs = await prisma.jobPosting.findMany({
      where: {
        ...(status && { status: status as string }),
        ...(department && { department: department as string }),
      },
      orderBy: { postedAt: 'desc' },
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { stage } = req.query;
    const candidates = await prisma.candidate.findMany({
      where: {
        jobId,
        ...(stage && { stage: stage as string }),
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;
    const { stage, rating, notes } = req.body;
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage, ...(rating && { rating }), ...(notes && { notes }) },
    });
    res.json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Resume Screening using Claude
 * Analyzes candidate resume against job requirements and provides AI-powered insights
 */
export const screenResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only HR/ADMIN can perform resume screening
    if (req.user?.role !== 'HR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only HR/ADMIN can perform resume screening',
      });
    }

    const { resumeText, jobRequirements, candidateId } = req.body;

    // Input validation
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required and must not be empty',
      });
    }

    if (!jobRequirements || typeof jobRequirements !== 'string' || jobRequirements.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job requirements are required and must not be empty',
      });
    }

    if (!candidateId || typeof candidateId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Candidate ID is required',
      });
    }

    // Verify candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please set ANTHROPIC_API_KEY in environment variables.',
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `
You are an expert HR recruiter. Analyze this resume and score the candidate's fit for the job.

JOB REQUIREMENTS:
${jobRequirements}

RESUME:
${resumeText}

Provide a JSON response with the following structure (and only JSON, no markdown formatting):
{
  "fitScore": <number between 0-100>,
  "strengths": [<string array, max 3 items>],
  "weaknesses": [<string array, max 3 items>],
  "skills": [<extracted skills array, max 10 items>],
  "experience": <years of relevant experience as a number>,
  "education": <highest degree as string>,
  "recommendation": "STRONG_FIT" | "MODERATE_FIT" | "WEAK_FIT" | "REJECT"
}
`;

    // Call Claude API
    let aiResponse;
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      // Extract text from response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse JSON response
      aiResponse = JSON.parse(responseText.trim());
    } catch (apiError: any) {
      console.error('Anthropic API Error:', apiError);
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze resume using AI service',
        details: apiError.message,
      });
    }

    // Validate AI response structure
    if (
      typeof aiResponse.fitScore !== 'number' ||
      !Array.isArray(aiResponse.strengths) ||
      !Array.isArray(aiResponse.weaknesses) ||
      !Array.isArray(aiResponse.skills) ||
      typeof aiResponse.recommendation !== 'string'
    ) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from AI service',
      });
    }

    // Update candidate with AI score
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { aiScore: aiResponse.fitScore },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id || '',
        action: 'AI_SCREEN',
        entity: 'CANDIDATE',
        entityId: candidateId,
        details: {
          fitScore: aiResponse.fitScore,
          recommendation: aiResponse.recommendation,
          jobTitle: candidate.job.title,
          screenedBy: req.user?.email,
        },
      },
    });

    // Return screening results
    res.json({
      success: true,
      data: {
        candidateId,
        candidateName: candidate.name,
        jobTitle: candidate.job.title,
        screening: {
          fitScore: aiResponse.fitScore,
          strengths: aiResponse.strengths,
          weaknesses: aiResponse.weaknesses,
          skills: aiResponse.skills,
          experience: aiResponse.experience,
          education: aiResponse.education,
          recommendation: aiResponse.recommendation,
        },
        updatedCandidate,
      },
    });
  } catch (error) {
    console.error('Resume screening error:', error);
    next(error);
  }
};
