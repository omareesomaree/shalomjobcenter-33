
import React from 'react';
import { MultiImageUploader } from '@/components/shared/image-uploader';

interface ImageUploadSectionProps {
  imagePreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  error?: string;
  clearAllImages?: () => void;
  onImagesUpload?: (imageUrls: string[]) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imagePreviews,
  onImagesUpload,
  error
}) => {
  
  // Utiliser directement notre nouveau composant qui gère le téléchargement vers un service externe
  return (
    <div className="space-y-2">
      <MultiImageUploader
        initialImages={imagePreviews}
        onImagesUpload={(urls) => {
          if (onImagesUpload) {
            onImagesUpload(urls);
          }
        }}
        label="Images du logement"
        maxImages={5}
        maxSizeMB={2}
      />
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};
