import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authToast } from '@/lib/toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import type { LoginFormData } from '@/features/auth/schemas';
import api from '@/lib/axios';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      if (res.data?.data?.user) {
        login(res.data.data.user);
      }
      authToast.success('Logged in successfully!');
      navigate('/analyzer');
    } catch (err: any) {
      authToast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface/30">
      {/* Vertically centered content area */}
      <div className="flex-1 flex items-center justify-center px-2 py-6">
        <div className="w-full max-w-[640px]">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-base text-muted-foreground mt-3">
              Sign in to your account to continue
            </p>
          </div>

          {/* Auth card */}
          <div className="rounded-2xl border border-border/60 bg-surface/80 shadow-lg shadow-black/20 p-12">
            <div className="flex flex-col gap-5">
              <GoogleAuthButton />

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border/50" />
                <span className="text-xs uppercase text-muted-foreground shrink-0">
                  Or continue with email
                </span>
                <div className="flex-1 border-t border-border/50" />
              </div>

              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Sign up free
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
