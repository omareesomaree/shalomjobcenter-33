
import React from 'react';
import { ImageUploader } from '@/components/shared/image-uploader';

interface FaviconSectionProps {
  faviconUrl: string;
  faviconUploading: boolean;
  handleFaviconUpload: (imageUrl: string) => void;
}

export const FaviconSection: React.FC<FaviconSectionProps> = ({
  faviconUrl,
  handleFaviconUpload
}) => {
  return (
    <div>
      <ImageUploader
        initialImage={faviconUrl}
        onImageUpload={handleFaviconUpload}
        label="Favicon du site"
        maxSizeMB={0.5}
      />
    </div>
  );
}
