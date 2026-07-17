import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been verified!'}
            {status === 'error' && (token ? 'The verification link is invalid or expired.' : 'No verification token provided.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex justify-center pt-2">
              <Button asChild className="w-full">
                <Link to="/login">Proceed to Login</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Enter your email address to receive a new verification link.
                </p>
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
        </CardContent>
        
        {status === 'error' && (
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
