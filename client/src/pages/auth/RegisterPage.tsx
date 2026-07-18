import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import type { RegisterFormData } from '@/features/auth/schemas';
import api from '@/lib/axios';
import { MailCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // When set, shows the "check your email" success state.
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await api.post('/auth/register', data);
      // Don't navigate — replace the form with a "check your email" screen.
      setRegisteredEmail(data.email);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    try {
      setIsResending(true);
      await api.post('/auth/resend-verification', { email: registeredEmail });
      toast.success('Verification email resent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // ── "Check your email" success screen ──────────────────────────────────────
  if (registeredEmail) {
    return (
      <div className="flex-1 flex flex-col bg-surface/30">
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[480px]">
            <div className="rounded-2xl border border-border/60 bg-surface/80 shadow-lg shadow-black/20 p-8 flex flex-col items-center text-center gap-5">

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a verification link to{' '}
                  <span className="font-semibold text-foreground">{registeredEmail}</span>.
                  Click the link to activate your account and get started.
                </p>
              </div>

              {/* What happens next */}
              <div className="w-full rounded-xl border border-border/50 bg-surface-raised/60 p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  What happens next
                </p>
                {[
                  'Open the verification email from CodexAI',
                  'Click "Verify Email Address"',
                  'Your account activates and you\'re automatically signed in',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full border-t border-border/40" />

              {/* Resend + fallback */}
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-sm text-muted-foreground">Didn't receive it?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-sm"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Resend verification email
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Wrong email?{' '}
                  <button
                    type="button"
                    onClick={() => setRegisteredEmail(null)}
                    className="font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Go back and re-register
                  </button>
                </p>
              </div>

              {/* Footer */}
              <p className="text-xs text-muted-foreground">
                Already verified?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-surface/30">
      <div className="flex-1 flex items-center justify-center px-2 py-6">
        <div className="w-full max-w-[680px]">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Get started with free AI-powered resume analysis
            </p>
          </div>

          {/* Auth card */}
          <div className="rounded-2xl border border-border/60 bg-surface/80 shadow-lg shadow-black/20 p-8">
            <div className="flex flex-col gap-5">
              <GoogleAuthButton isRegister />

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border/50" />
                <span className="text-xs uppercase text-muted-foreground shrink-0">
                  Or continue with email
                </span>
                <div className="flex-1 border-t border-border/50" />
              </div>

              <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link
                to="/terms"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
