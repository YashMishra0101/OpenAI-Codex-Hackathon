import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
  const [isUploading, setIsUploading] = useState(false);
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
      setIsUploading(true);
      setImgError(false);
      const res = await api.patch('/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile picture updated!');
      onSuccess(res.data.data.profileImage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const showImage = Boolean(currentImageUrl) && !imgError;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar */}
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-muted bg-muted flex items-center justify-center">
        {isUploading ? (
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

      {/* Only show upload controls for non-Google users */}
      {!isGoogleUser && (
        <>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Uploading...' : 'Change Picture'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">JPEG, PNG or WebP. Max 5MB.</p>
        </>
      )}
    </div>
  );
}
