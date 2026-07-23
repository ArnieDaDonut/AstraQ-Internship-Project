import React, { useState, useRef } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfilePictureUploadProps {
  size?: number;
  className?: string;
}

export default function ProfilePictureUpload({ size = 40, className = '' }: ProfilePictureUploadProps) {
  const { user, token, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the presigned URL on first render
  const [hasFetched, setHasFetched] = useState(false);
  React.useEffect(() => {
    if (!hasFetched && token && user?.profile_picture_url) {
      fetch('/api/profile/picture', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.url) setPictureUrl(data.url);
        })
        .catch(() => {});
      setHasFetched(true);
    }
  }, [hasFetched, token, user?.profile_picture_url]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Update the user context with new path
        if (user) {
          updateUser({ ...user, profile_picture_url: data.path });
        }
        // Fetch the presigned URL for the new picture
        const picRes = await fetch('/api/profile/picture', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const picData = await picRes.json();
        if (picData.url) {
          setPictureUrl(picData.url);
          setPreviewUrl(null);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || pictureUrl;

  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={handleClick}
        className="relative rounded-full overflow-hidden border-2 border-[#121212]/20 dark:border-white/20 hover:border-[#121212]/50 dark:hover:border-white/50 transition-colors cursor-pointer"
        style={{ width: size, height: size }}
        title="Change profile picture"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#E2D1C3] dark:bg-[#4A3B32] flex items-center justify-center">
            <UserIcon className="w-1/2 h-1/2 text-[#4A3B32] dark:text-[#E2D1C3]" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Upload spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
