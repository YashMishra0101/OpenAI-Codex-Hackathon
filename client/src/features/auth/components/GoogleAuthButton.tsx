import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { authToast } from '@/lib/toast';
import api from '@/lib/axios';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface GoogleAuthButtonProps {
  isRegister?: boolean;
}

export function GoogleAuthButton({ isRegister = false }: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    
    try {
      setIsLoading(true);
      const res = await api.post('/auth/google', { credential: response.credential });
      if (res.data?.data?.user) {
        login(res.data.data.user);
      }
      authToast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully!');
      navigate('/analyzer');
    } catch (err: any) {
      authToast.error(err.response?.data?.message || 'Google authentication failed');
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
        onError={() => authToast.error('Google login failed')}
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
