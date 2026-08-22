/**
 * Type definitions for AI Resume Screening API
 */

export type RecommendationType = 'STRONG_FIT' | 'MODERATE_FIT' | 'WEAK_FIT' | 'REJECT';

export interface ResumeScreeningRequest {
  resumeText: string;
  jobRequirements: string;
  candidateId: string;
}

export interface ResumeScreeningResult {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  experience: number;
  education: string;
  recommendation: RecommendationType;
}

export interface ResumeScreeningResponse {
  success: boolean;
  data: {
    candidateId: string;
    candidateName: string;
    jobTitle: string;
    screening: ResumeScreeningResult;
    updatedCandidate: {
      id: string;
      name: string;
      email: string;
      aiScore: number;
      [key: string]: any;
    };
  };
}

export interface ResumeScreeningError {
  success: false;
  error: string;
  details?: string;
}
