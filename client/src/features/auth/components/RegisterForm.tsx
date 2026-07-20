import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  getPasswordStrength,
  passwordRequirements,
  registerSchema,
  type RegisterFormData,
} from '../schemas';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword && password.length > 0;
  const passwordStrength = getPasswordStrength(password);
  const strengthPercent = (passwordStrength.score / passwordRequirements.length) * 100;
  const strengthColor =
    passwordStrength.label === 'Strong'
      ? 'bg-emerald-500'
      : passwordStrength.label === 'Medium'
        ? 'bg-amber-400'
        : 'bg-destructive';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Live Demo Warning */}
        <div className="flex items-start gap-2 p-3 mb-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <ShieldAlert className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-[11px] text-yellow-700 dark:text-yellow-400 font-semibold">
              Live Demo Limitation
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Email Signup is disabled in this live demo. Please use the <strong className="text-white">Google Sign-In</strong> button to create an account!
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              I am using Nodemailer with my personal Gmail account instead of a premium email service because this is a hackathon project. I'm working entirely with free-tier resources, so purchasing a paid email service isn't an option. That's why email signup isn't working reliably in production. I have tried every possible method and configuration I could find, but I haven't found a free solution that works reliably in a production environment.
            </p>
          </div>
        </div>

        {/* Row 1: Full Name + Email */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    type="text"
                    autoComplete="name"
                    disabled={isLoading}
                    className="h-10 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-10 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Password + Confirm Password */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Create a strong password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-10 text-sm pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Re-enter your password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-10 text-sm pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password match / mismatch notification */}
        {(passwordsMismatch || passwordsMatch) && (
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium',
              'transition-all duration-300 animate-in fade-in slide-in-from-top-1',
              passwordsMismatch
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            )}
          >
            {passwordsMismatch ? (
              <>
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Passwords don&apos;t match — please check and try again.</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Passwords match — you&apos;re good to go!</span>
              </>
            )}
          </div>
        )}

        {/* Password Strength — full-width below the password row */}
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">Password strength</span>
            <span
              className={cn(
                'text-xs font-semibold',
                !password
                  ? 'text-muted-foreground'
                  : passwordStrength.label === 'Strong'
                  ? 'text-emerald-400'
                  : passwordStrength.label === 'Medium'
                    ? 'text-amber-300'
                    : 'text-destructive',
              )}
            >
              {password ? passwordStrength.label : ''}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border/50">
            <div
              className={cn('h-full rounded-full transition-all duration-200', strengthColor)}
              style={{
                width: `${Math.max(password ? strengthPercent : 0, password ? 18 : 0)}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {passwordRequirements.map((requirement) => {
              const isMet = requirement.test(password);
              return (
                <div
                  key={requirement.id}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition-colors',
                    isMet ? 'text-emerald-400' : 'text-muted-foreground',
                  )}
                >
                  <CheckCircle2
                    className={cn('h-3 w-3 shrink-0', !isMet && 'opacity-35')}
                  />
                  <span>{requirement.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}