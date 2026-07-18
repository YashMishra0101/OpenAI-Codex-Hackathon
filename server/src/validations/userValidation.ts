import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be 100 characters or fewer')
      .optional(),
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim()
      .optional(),
    // Current password is required when changing the password —
    // prevents session hijacking from leading to permanent account takeover.
    currentPassword: z
      .string()
      .min(1, 'Current password is required to change your password')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer')
      .optional(),
  })
  .refine(
    (data) => {
      // If a new password is being set, currentPassword must also be provided
      if (data.password && !data.currentPassword) return false;
      return true;
    },
    {
      message: 'Current password is required to set a new password',
      path: ['currentPassword'],
    },
  );

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
