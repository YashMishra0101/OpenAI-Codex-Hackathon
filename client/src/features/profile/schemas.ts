import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')
    .optional()
    .or(z.literal('')),
  socialLinks: z
    .object({
      linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      portfolio: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    })
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
