import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface GoogleAuthButtonProps {
  isRegister?: boolean;
}

export function GoogleAuthButton({ isRegister = false }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    
    try {
      setIsLoading(true);
      await api.post('/auth/google', { credential: response.credential });
      toast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully!');
      // Reload the application to hydrate the global AuthContext
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-md">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google login failed')}
        useOneTap
        theme="filled_black"
        size="large"
        shape="rectangular"
        text={isRegister ? 'signup_with' : 'signin_with'}
        width="100%"
      />
    </div>
  );
}
