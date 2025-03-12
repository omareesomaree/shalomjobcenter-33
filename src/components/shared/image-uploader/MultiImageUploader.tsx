
import React, { useState } from 'react';
import { Upload, X, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage, uploadMultipleImages } from '@/services/imageService';

export interface MultiImageUploaderProps {
  initialImages?: string[];
  onImagesUpload: (imageUrls: string[]) => void;
  className?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  maxImages?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  initialImages = [],
  onImagesUpload,
  className = '',
  label = 'Télécharger des images',
  accept = 'image/*',
  maxSizeMB = 5,
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>(initialImages || []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérification du nombre total d'images
    if (previews.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées`);
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setIsUploading(true);
    setError(null);

    // Vérifier chaque fichier
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`L'image ${file.name} est trop volumineuse (max ${maxSizeMB}MB)`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      // Créer des URLs pour les aperçus locaux
      const localPreviews = Array.from(validFiles).map(file => URL.createObjectURL(file));
      const updatedPreviews = [...previews, ...localPreviews];
      setPreviews(updatedPreviews);

      // Télécharger les images vers le service distant
      const uploadedUrls = await Promise.all(
        validFiles.map(file => uploadImage(file))
      );
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        const allImages = [...previews.filter(p => p.startsWith('http')), ...validUrls];
        onImagesUpload(allImages);
        toast.success(`${validUrls.length} image(s) téléchargée(s) avec succès`);
      } else {
        throw new Error("Échec du téléchargement des images");
      }
    } catch (err) {
      console.error("Erreur d'upload:", err);
      setError("Échec du téléchargement des images");
      toast.error("Échec du téléchargement des images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    // Ne garder que les URLs HTTP
    const httpUrls = newPreviews.filter(url => url.startsWith('http'));
    onImagesUpload(httpUrls);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={`${preview}-${index}`} className="relative rounded-md overflow-hidden border border-gray-200 aspect-square">
            <img 
              src={preview} 
              alt={`Image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {previews.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-md aspect-square flex flex-col items-center justify-center">
            <input
              type="file"
              id="multi-image-upload"
              accept={accept}
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploading}
              multiple
            />
            
            <label 
              htmlFor="multi-image-upload" 
              className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
              <p className="mt-2 text-xs text-gray-500 text-center px-2">
                {isUploading ? 'Téléchargement...' : 'Ajouter des images'}
              </p>
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center text-red-500 text-xs mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}
      
      <p className="text-xs text-gray-400">
        {previews.length}/{maxImages} images • Formats: JPG, PNG, WEBP • Max {maxSizeMB}MB par image
      </p>
    </div>
  );
};
