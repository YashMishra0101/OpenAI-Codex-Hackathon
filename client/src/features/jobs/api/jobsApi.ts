import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'OnHold' | 'Withdrawn';

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
  reminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingReminder {
  _id: string;
  scheduledAt: string;
  notes?: string;
}

export type JobStats = {
  Saved: number;
  Applied: number;
  Interview: number;
  Offer: number;
  Rejected: number;
  OnHold: number;
  Withdrawn: number;
  TotalReminders: number;
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
    // Poll every 30 seconds so the Reminder badge count corrects itself
    // automatically after a background Agenda job fires an email and
    // decrements reminderCount in the database. Without this, the 5-minute
    // global staleTime keeps showing the stale count until a manual refresh.
    refetchInterval: 30 * 1000,
  });
}

export function useGetReminders(jobId: string | null) {
  return useQuery({
    queryKey: ['reminders', jobId],
    queryFn: async (): Promise<PendingReminder[]> => {
      const response = await api.get(`/jobs/${jobId}/reminders`);
      return response.data.data;
    },
    enabled: !!jobId,
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
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
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
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
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
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}

export function useScheduleReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, notes }: { id: string; date: string; notes?: string }) => {
      const response = await api.post(`/jobs/${id}/reminders`, { date, notes });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate jobs so reminderCount on cards updates immediately
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      // Invalidate reminders list for this job
      void queryClient.invalidateQueries({ queryKey: ['reminders', variables.id] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, reminderId, date, notes }: { jobId: string; reminderId: string; date: string; notes?: string }) => {
      const response = await api.put(`/jobs/${jobId}/reminders/${reminderId}`, { date, notes });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate both lists and job stats to instantly reflect changes
      void queryClient.invalidateQueries({ queryKey: ['reminders', variables.jobId] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, reminderId }: { jobId: string; reminderId: string }) => {
      const response = await api.delete(`/jobs/${jobId}/reminders/${reminderId}`);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Update reminder list and job card counts
      void queryClient.invalidateQueries({ queryKey: ['reminders', variables.jobId] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    },
  });
}
