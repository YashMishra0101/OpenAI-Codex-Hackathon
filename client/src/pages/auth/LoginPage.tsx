import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import type { LoginFormData } from '@/features/auth/schemas';
import api from '@/lib/axios';
import { FileText, KanbanSquare, Search } from 'lucide-react';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await api.post('/auth/login', data);
      toast.success('Logged in successfully!');
      
      // Reload the application to hydrate the global AuthContext
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/register"
        className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Sign up
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
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          
          <div className="grid gap-6">
            <GoogleAuthButton />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </div>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
