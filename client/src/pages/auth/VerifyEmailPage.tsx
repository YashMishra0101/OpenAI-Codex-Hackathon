import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MailCheck, MailX, ArrowRight, RefreshCw, MailOpen } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';

type VerifyStatus = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();

  const [status, setStatus] = useState<VerifyStatus>(token ? 'loading' : 'error');
  const [errorType, setErrorType] = useState<'invalid' | 'expired' | 'no-token' | 'unknown'>('no-token');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token || verifyAttempted.current) return;
    verifyAttempted.current = true;

    api.post('/auth/verify-email', { token })
      .then((res) => {
        // Automatically log the user in using the session returned from the API
        if (res.data?.data?.user) {
          login(res.data.data.user);
        }
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        const msg: string = (err.response?.data?.message ?? '').toLowerCase();
        // Backend now sends distinct messages:
        // 'Verification link has expired. Please request a new one.'
        // 'Invalid verification link. Please request a new one.'
        if (msg.includes('expired')) {
          setErrorType('expired');
        } else if (msg.includes('invalid')) {
          setErrorType('invalid');
        } else if (token) {
          setErrorType('unknown');
        } else {
          setErrorType('no-token');
        }
      });
  }, [token]);

  const validateEmail = (value: string) => {
    if (!value) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
    return '';
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError('');

    try {
      setIsResending(true);
      await api.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      authToast.success('Verification email sent! Check your inbox.');
      setEmail('');
    } catch (err: any) {
      authToast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  /* ── Per-state content ─────────────────────────────────────────────────── */

  const stateContent = {
    loading: {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ),
      title: 'Verifying your email…',
      description: 'Please hold on while we confirm your email address. This should only take a moment.',
    },
    success: {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-emerald-400" />
        </div>
      ),
      title: 'Email verified!',
      description: 'Your email address has been successfully verified. You\'re all set — welcome to CodexAI.',
    },
    error: {
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <MailX className="w-8 h-8 text-red-400" />
        </div>
      ),
      title:
        errorType === 'expired'
          ? 'Link has expired'
          : errorType === 'invalid'
            ? 'Invalid verification link'
            : errorType === 'no-token'
              ? 'No verification link'
              : 'Verification failed',
      description:
        errorType === 'expired'
          ? 'Your verification link has expired. Verification links are valid for 24 hours. Enter your email below to get a fresh one.'
          : errorType === 'invalid'
            ? 'This verification link doesn\'t look right — it may have been modified or already used. Enter your email below to request a new one.'
            : errorType === 'no-token'
              ? 'No verification token was found. If you signed up recently, enter your email below to resend the verification link.'
              : 'Something unexpected happened while verifying your email. Enter your email below and we\'ll send you a fresh link.',
    },
  };

  const { icon, title, description } = stateContent[status];

  return (
    <div className="flex-1 flex flex-col bg-surface/30">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">

          {/* Card */}
          <div className="rounded-2xl border border-border/60 bg-surface/80 shadow-lg shadow-black/20 p-8 flex flex-col items-center text-center gap-5">

            {/* Icon */}
            {icon}

            {/* Heading + description */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>

            {/* ── SUCCESS ── */}
            {status === 'success' && (
              <div className="w-full flex flex-col gap-3 pt-1">
                <Button asChild className="w-full h-10 text-sm font-medium">
                  <Link to="/analyzer">
                    Continue to Resume Checker
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* ── ERROR — resend form ── */}
            {status === 'error' && (
              <div className="w-full flex flex-col gap-4 pt-1">
                {resendSuccess ? (
                  /* Post-resend success state */
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2.5 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-400">
                      <MailOpen className="h-4 w-4 shrink-0" />
                      <span>Email sent! Check your inbox and spam folder.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResendSuccess(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                    >
                      Didn't receive it? Try again
                    </button>
                  </div>
                ) : (
                  /* Resend form */
                  <form onSubmit={handleResend} className="w-full flex flex-col gap-3" noValidate>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="resend-email" className="text-sm font-medium">
                        Email address
                      </label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        disabled={isResending}
                        className={cn('h-10 text-sm', emailError && 'border-red-500/70 focus-visible:ring-red-500/40')}
                        autoComplete="email"
                      />
                      {emailError && (
                        <p className="text-xs text-red-400">{emailError}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-10 text-sm font-medium"
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending email…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="w-full border-t border-border/40" />

            {/* Footer links */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {status === 'error' && (
                <p className="text-sm text-muted-foreground">
                  Already verified?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <a
                  href="mailto:support@codexai.com"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}