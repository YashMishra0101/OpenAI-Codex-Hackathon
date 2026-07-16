import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import type { LoginFormData } from '@/features/auth/schemas';
import api from '@/lib/axios';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await api.post('/api/v1/auth/login', data);
      toast.success('Logged in successfully!');
      
      // Temporary navigate to dashboard, will wire up actual auth state later in Phase 6
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleAuthButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="ml-1 font-medium text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
