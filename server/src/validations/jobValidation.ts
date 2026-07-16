import { z } from 'zod';

export const jobStatusEnum = z.enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']);

export const createJobSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(100),
    jobTitle: z.string().min(1, 'Job title is required').max(100),
    status: jobStatusEnum.optional().default('Saved'),
    url: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
    location: z.string().max(100).optional(),
    salary: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
    appliedDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(100).optional(),
    jobTitle: z.string().min(1, 'Job title is required').max(100).optional(),
    status: jobStatusEnum.optional(),
    url: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
    location: z.string().max(100).optional(),
    salary: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
    appliedDate: z.string().datetime().optional().nullable(),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
