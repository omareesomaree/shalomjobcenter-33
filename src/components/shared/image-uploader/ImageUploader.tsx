
import React, { useState } from 'react';
import { Upload, X, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage, uploadBase64Image, isImageUrlValid } from '@/services/imageService';

export interface ImageUploaderProps {
  initialImage?: string;
  onImageUpload: (imageUrl: string) => void;
  className?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImage,
  onImageUpload,
  className = '',
  label = 'Télécharger une image',
  accept = 'image/*',
  maxSizeMB = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [retryCount, setRetryCount] = useState(0);

  // Vérifier l'initialImage au démarrage
  React.useEffect(() => {
    const checkInitialImage = async () => {
      if (initialImage) {
        if (initialImage.startsWith('http')) {
          try {
            const isValid = await isImageUrlValid(initialImage);
            if (!isValid) {
              console.warn("L'image initiale est invalide:", initialImage);
              setError("L'image initiale n'est pas accessible");
              setPreview(null);
            } else {
              setPreview(initialImage);
              setError(null);
            }
          } catch (err) {
            console.error("Erreur lors de la vérification de l'image:", err);
            setError("Erreur lors de la vérification de l'image");
            setPreview(null);
          }
        } else {
          // Pour les data URLs ou autres formats
          setPreview(initialImage);
          setError(null);
        }
      }
    };
    
    checkInitialImage();
  }, [initialImage, retryCount]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de la taille du fichier
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`L'image doit être inférieure à ${maxSizeMB}MB`);
      toast.error(`L'image est trop volumineuse (max ${maxSizeMB}MB)`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Créer une URL pour l'aperçu local
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Télécharger l'image vers le service distant
      const uploadedUrl = await uploadImage(file);
      
      if (uploadedUrl) {
        URL.revokeObjectURL(localPreview); // Libérer la mémoire
        setPreview(uploadedUrl);
        onImageUpload(uploadedUrl);
        toast.success("Image téléchargée avec succès");
      } else {
        throw new Error("Échec du téléchargement de l'image");
      }
    } catch (err) {
      console.error("Erreur d'upload:", err);
      setError("Échec du téléchargement de l'image");
      toast.error("Échec du téléchargement de l'image. Réessayez avec une image plus petite.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onImageUpload('');
    setError(null);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    toast.info("Nouvelle tentative de chargement de l'image...");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200 h-[150px]">
          <img 
            src={`${preview}?t=${new Date().getTime()}`} // Ajouter un timestamp pour éviter la mise en cache
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={() => {
              console.error("Erreur de chargement de l'aperçu:", preview);
              setError("Impossible de charger l'image. Essayez de télécharger à nouveau.");
            }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            {error && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleRetry}
                className="h-8 w-8 rounded-full bg-white/70"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={clearImage}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <input
            type="file"
            id="image-upload"
            accept={accept}
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploading}
          />
          
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer flex flex-col items-center justify-center w-full"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-gray-400" />
            )}
            <p className="mt-2 text-sm text-gray-500">
              {isUploading ? 'Téléchargement en cours...' : 'Cliquez pour sélectionner une image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Formats acceptés: JPG, PNG, WEBP (max {maxSizeMB}MB)
            </p>
          </label>
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-red-500 text-xs mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};
