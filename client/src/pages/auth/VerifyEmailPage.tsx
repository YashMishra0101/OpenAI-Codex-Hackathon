import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MailCheck, XCircle, FileText, KanbanSquare, Search } from 'lucide-react';
import api from '@/lib/axios';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token || verifyAttempted.current) return;
    verifyAttempted.current = true;

    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setIsResending(true);
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent (if account exists).');
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/login"
        className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Sign in
      </Link>
      
      {/* Left side branding (hidden on mobile) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center gap-2 font-bold text-lg text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">C</span>
          </div>
          <span className="text-white">Codex<span className="text-primary">AI</span></span>
        </div>
        
        <div className="relative z-20 mt-auto space-y-10">
          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            The ultimate AI toolkit <br />to land your next role.
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base font-medium text-zinc-300">AI Resume Checker</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                <KanbanSquare className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base font-medium text-zinc-300">Smart Job Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base font-medium text-zinc-300">Advanced Google Dorks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="lg:p-8 flex items-center justify-center w-full h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          
          <div className="flex flex-col space-y-2 text-center items-center">
            {status === 'loading' && <LoadingSpinner size="lg" className="mb-4" />}
            {status === 'success' && <MailCheck className="h-12 w-12 text-primary mb-2" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-destructive mb-2" />}
            
            <h1 className="text-2xl font-semibold tracking-tight">
              Email Verification
            </h1>
            <p className="text-sm text-muted-foreground">
              {status === 'loading' && 'Verifying your email address, please wait...'}
              {status === 'success' && 'Your email has been successfully verified!'}
              {status === 'error' && (token ? 'The verification link is invalid or expired.' : 'No verification token provided.')}
            </p>
          </div>
          
          <div className="grid gap-6">
            {status === 'success' && (
              <Button asChild className="w-full">
                <Link to="/login">Proceed to Login</Link>
              </Button>
            )}

            {status === 'error' && (
              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isResending}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isResending}>
                  {isResending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </form>
            )}
          </div>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            Having trouble?{' '}
            <a href="mailto:support@codexai.com" className="underline underline-offset-4 hover:text-primary">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
