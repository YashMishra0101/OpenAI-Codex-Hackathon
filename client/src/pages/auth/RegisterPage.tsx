import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import type { RegisterFormData } from '@/features/auth/schemas';
import api from '@/lib/axios';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await api.post('/auth/register', data);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account');
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
            <h1 className="text-4xl font-bold tracking-tight">Create an account</h1>
            <p className="text-base text-muted-foreground mt-3">
              Get started with free AI-powered resume analysis
            </p>
          </div>

          {/* Auth card */}
          <div className="rounded-2xl border border-border/60 bg-surface/80 shadow-lg shadow-black/20 p-12">
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
