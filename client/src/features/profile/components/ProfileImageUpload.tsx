import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import api from '@/lib/axios';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onSuccess: (newImageUrl: string) => void;
}

export function ProfileImageUpload({ currentImageUrl, onSuccess }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res = await api.patch('/api/v1/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile picture updated!');
      onSuccess(res.data.data.profileImage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-muted bg-muted flex items-center justify-center">
        {isUploading ? (
          <LoadingSpinner size="lg" />
        ) : currentImageUrl ? (
          <img src={currentImageUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl text-muted-foreground">?</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
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
      </div>
      <p className="text-xs text-muted-foreground text-center">
        JPEG, PNG or WebP. Max 5MB.
      </p>
    </div>
  );
}
