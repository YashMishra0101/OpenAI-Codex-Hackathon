import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Upload, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  /** Used to generate initials as a fallback when no image is available. */
  userName?: string;
  /** When true the Change Picture button is hidden — Google users cannot change their avatar here. */
  isGoogleUser?: boolean;
  onSuccess: (newImageUrl: string) => void;
}

export function ProfileImageUpload({
  currentImageUrl,
  userName,
  isGoogleUser = false,
  onSuccess,
}: ProfileImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImgError = () => setImgError(true);

  // Derive up to 2 initials from the user's display name
  const initials = userName
    ? userName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsLoading(true);
      setImgError(false);
      const res = await api.patch('/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile picture updated!');
      onSuccess(res.data.data.profileImage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsLoading(true);
      setImgError(false);
      await api.delete('/users/me/profile-image');
      toast.success('Profile picture removed!');
      onSuccess('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setIsLoading(false);
    }
  };

  const showImage = Boolean(currentImageUrl) && !imgError;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Avatar */}
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-muted bg-muted flex items-center justify-center">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : showImage ? (
          <img
            src={currentImageUrl}
            alt="Profile picture"
            className="h-full w-full object-cover"
            onError={handleImgError}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-3xl font-semibold text-muted-foreground select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col w-full max-w-[200px] space-y-2 text-center">
        {!isGoogleUser ? (
          <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {showImage ? 'Change picture' : 'Upload picture'}
            </Button>
            {showImage && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isLoading}
                onClick={handleRemoveImage}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              JPEG, PNG, or WebP. Max 5MB.
            </p>
          </>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Avatar managed by Google.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
