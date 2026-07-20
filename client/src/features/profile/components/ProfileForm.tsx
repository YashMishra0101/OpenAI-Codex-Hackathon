import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileFormData } from '../schemas';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import api from '@/lib/axios';

interface UserData {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isVerified: boolean;
  authProvider: 'email' | 'google';
}

interface ProfileFormProps {
  initialData: UserData | null;
  /** When true the form is read-only — Google users cannot edit name/email/password here. */
  isGoogleUser?: boolean;
  onSuccess: (data: UserData) => void;
}

export function ProfileForm({ initialData, isGoogleUser = false, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        password: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    const isNameChanged = data.name !== initialData?.name;
    const isPasswordChanged = !!data.password;

    if (!isNameChanged && !isPasswordChanged) {
      toast('No changes to save.');
      return;
    }

    try {
      setIsLoading(true);
      // We don't send the email since it's read-only now
      const payload: Partial<UpdateProfileFormData> = {};
      if (isNameChanged) payload.name = data.name;
      if (isPasswordChanged) payload.password = data.password;
      
      const res = await api.put('/users/me', payload);
      
      if (isNameChanged && isPasswordChanged) {
        toast.success('Profile updated successfully.');
      } else if (isNameChanged) {
        toast.success('Name updated successfully.');
      } else if (isPasswordChanged) {
        toast.success('Password updated successfully.');
      }

      form.setValue('password', '');
      onSuccess(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google user — read-only view ────────────────────────────────────────────
  if (isGoogleUser) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Full Name</p>
          <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
            {initialData?.name || '—'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Email</p>
          <p className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
            {initialData?.email || '—'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          To change your name or email, update them directly in your{' '}
          <a
            href="https://myaccount.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            Google account
          </a>
          .
        </p>
      </div>
    );
  }

  // ── Email/password user — editable form ─────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="m@example.com" 
                  readOnly 
                  className="bg-muted/50 text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 cursor-not-allowed"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password (leave blank to keep current)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    disabled={isLoading} 
                    className="pr-10"
                    {...field} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
}

