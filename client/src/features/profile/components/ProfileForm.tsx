import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
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
}

interface ProfileFormProps {
  initialData: UserData | null;
  /** When true the form is read-only — Google users cannot edit name/email/password here. */
  isGoogleUser?: boolean;
  onSuccess: (data: UserData) => void;
}

export function ProfileForm({ initialData, isGoogleUser = false, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      const res = await api.put('/users/me', data);
      toast.success('Profile updated successfully');
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
              <FormLabel>Email (Changing this requires re-verification)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" disabled={isLoading} {...field} />
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
                <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
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
