import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface ResumeHistoryItem {
  _id: string;
  user: string;
  jobDescription?: string;
  searchPreferences?: string;
  verdict: 'Strong' | 'Partial' | 'Weak';
  analysis: {
    strengths: string[];
    improvements: string[];
  };
  interviewQuestions: string[];
  searchQueries: Array<{
    query: string;
    category: 'job' | 'learning' | 'interview';
  }>;
  questionGenerationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDetail extends ResumeHistoryItem {
  resumeText: string;
}

/**
 * Hook to fetch the user's history of AI resume analyses.
 */
export function useResumeHistory() {
  return useQuery({
    queryKey: ['resumeHistory'],
    queryFn: async (): Promise<ResumeHistoryItem[]> => {
      const response = await api.get('/resumes');
      return response.data.data;
    },
  });
}

/**
 * Hook to fetch a specific resume analysis by ID.
 */
export function useResumeById(id?: string) {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: async (): Promise<ResumeDetail> => {
      if (!id) throw new Error('ID is required');
      const response = await api.get(`/resumes/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}
