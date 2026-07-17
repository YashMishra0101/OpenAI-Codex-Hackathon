import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { ProfileImageUpload } from '@/features/profile/components/ProfileImageUpload';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserData } from '@/features/auth/context/AuthContext';

export function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  
  // Create a local copy to avoid modifying the auth context directly until save succeeds
  const [userData, setUserData] = useState<UserData | null>(user);

  useEffect(() => {
    // Sync local state when global auth user changes
    if (user) setUserData(user);
  }, [user]);

  const handleProfileUpdate = (newData: UserData) => {
    setUserData(newData);
    updateUser(newData);
  };

  const handleImageUpdate = (newImageUrl: string) => {
    if (!userData) return;
    const updated = { ...userData, profileImage: newImageUrl };
    setUserData(updated);
    updateUser(updated);
  };

  if (authLoading || !userData) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isGoogleUser = userData?.authProvider === 'google';

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          {isGoogleUser
            ? 'Your profile is managed by Google.'
            : 'Manage your account settings and profile information.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column — Profile Picture */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              {isGoogleUser && (
                <CardDescription>Synced from your Google account.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <ProfileImageUpload
                currentImageUrl={userData?.profileImage}
                userName={userData?.name}
                isGoogleUser={isGoogleUser}
                onSuccess={handleImageUpdate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Personal Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isGoogleUser
                  ? 'Your name and email are provided by Google and cannot be changed here.'
                  : 'Update your name, email, or password.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={userData}
                isGoogleUser={isGoogleUser}
                onSuccess={handleProfileUpdate}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
