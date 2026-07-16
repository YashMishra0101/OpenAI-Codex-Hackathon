import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
      await api.post('/api/v1/auth/register', data);
      toast.success('Account created! Please check your email to verify.');
      
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleAuthButton isRegister />
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
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
