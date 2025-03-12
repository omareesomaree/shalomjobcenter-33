
import React from 'react';
import { ImageUploader } from '@/components/shared/image-uploader';

interface ImageUploadFieldProps {
  label: string;
  imageUrl: string;
  onUpload: (imageUrl: string) => void;
  isUploading: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  imageUrl,
  onUpload,
  isUploading
}) => {
  return (
    <div className="flex-1">
      <ImageUploader
        initialImage={imageUrl}
        onImageUpload={onUpload}
        label={label}
        maxSizeMB={1}
      />
    </div>
  );
};
