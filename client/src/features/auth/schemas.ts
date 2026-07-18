import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

export const passwordRequirements = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value: string) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

const strongPasswordMessage =
  'Use 8+ characters with uppercase, lowercase, number, and special character.';

export function getPasswordStrength(password: string): {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong';
} {
  const score = passwordRequirements.filter((requirement) => requirement.test(password)).length;

  if (score >= passwordRequirements.length) return { score, label: 'Strong' };
  if (score >= 3) return { score, label: 'Medium' };
  return { score, label: 'Weak' };
}

export const strongPasswordSchema = z
  .string({ required_error: 'Password is required' })
  .min(PASSWORD_MIN_LENGTH, strongPasswordMessage)
  .max(72, 'Password must be 72 characters or fewer')
  .refine(
    (value) => passwordRequirements.every((requirement) => requirement.test(value)),
    strongPasswordMessage,
  );

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: strongPasswordSchema,
  confirmPassword: z
    .string({ required_error: 'Please confirm your password' })
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
