import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

interface AnalyzeResumeVariables {
  resume: File;
  jobDescription?: string;
  searchPreferences?: string;
}

interface AIResponse {
  overallVerdict: 'Strong' | 'Partial' | 'Weak';
  analysis: {
    strengths: string[];
    improvements: string[];
  };
  interviewQuestions: string[];
  searchQueries: Array<{
    query: string;
    category: 'job' | 'learning' | 'interview';
  }>;
}

export interface AnalyzeResumeResponse {
  success: boolean;
  data: {
    _id: string;
    resumeText: string;
    verdict: AIResponse['overallVerdict'];
    analysis: AIResponse['analysis'];
    interviewQuestions: AIResponse['interviewQuestions'];
    searchQueries: AIResponse['searchQueries'];
    createdAt: string;
  };
}

/**
 * Uploads a PDF resume and optional text fields to the AI analyzer endpoint.
 */
export function useAnalyzeResume() {
  return useMutation({
    mutationFn: async (variables: AnalyzeResumeVariables): Promise<AnalyzeResumeResponse> => {
      const formData = new FormData();
      formData.append('resume', variables.resume);
      
      if (variables.jobDescription) {
        formData.append('jobDescription', variables.jobDescription);
      }
      if (variables.searchPreferences) {
        formData.append('searchPreferences', variables.searchPreferences);
      }

      const response = await api.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
  });
}
