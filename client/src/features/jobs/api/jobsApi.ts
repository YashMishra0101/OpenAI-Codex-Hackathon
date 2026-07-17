import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  _id: string;
  companyName: string;
  jobTitle: string;
  status: JobStatus;
  url?: string;
  location?: string;
  salary?: string;
  notes?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStats = {
  Saved: number;
  Applied: number;
  Interview: number;
  Offer: number;
  Rejected: number;
};

// --- Queries ---

export function useJobs(status?: string) {
  return useQuery({
    queryKey: ['jobs', status],
    queryFn: async (): Promise<JobApplication[]> => {
      const params = status ? { status } : {};
      const response = await api.get('/jobs', { params });
      return response.data.data;
    },
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: ['jobStats'],
    queryFn: async (): Promise<JobStats> => {
      const response = await api.get('/jobs/stats');
      return response.data.data;
    },
  });
}

// --- Mutations ---

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<JobApplication>) => {
      const response = await api.post('/jobs', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobApplication> }) => {
      const response = await api.put(`/jobs/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/jobs/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}

export function useScheduleReminder() {
  return useMutation({
    mutationFn: async ({ id, date, notes }: { id: string; date: string; notes?: string }) => {
      const response = await api.post(`/jobs/${id}/reminders`, { date, notes });
      return response.data;
    },
  });
}
