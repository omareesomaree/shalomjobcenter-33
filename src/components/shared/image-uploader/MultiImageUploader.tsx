
import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage, uploadMultipleImages, isImageUrlValid } from '@/services/imageService';

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
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<{[index: number]: boolean}>({});
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Vérifier et valider les images initiales
  useEffect(() => {
    const validateInitialImages = async () => {
      // Nettoyer les blob URLs existantes
      previews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      if (!initialImages || initialImages.length === 0) {
        setPreviews([]);
        return;
      }
      
      // Vérifier chaque URL d'image
      const validImages: string[] = [];
      const newImageErrors: {[index: number]: boolean} = {};
      
      for (let i = 0; i < initialImages.length; i++) {
        const img = initialImages[i];
        if (!img) continue;
        
        if (img.startsWith('http')) {
          try {
            const isValid = await isImageUrlValid(img);
            if (isValid) {
              validImages.push(img);
            } else {
              console.warn(`L'image à l'index ${i} est invalide:`, img);
              newImageErrors[i] = true;
            }
          } catch (err) {
            console.error(`Erreur lors de la vérification de l'image à l'index ${i}:`, err);
            newImageErrors[i] = true;
          }
        } else {
          // Pour les data URLs ou autres formats
          validImages.push(img);
        }
      }
      
      setImageErrors(newImageErrors);
      setPreviews(validImages);
      
      // Si le nombre d'images valides est différent du nombre initial, notifier onImagesUpload
      if (validImages.length !== initialImages.length) {
        console.log(`${initialImages.length - validImages.length} images invalides ont été filtrées`);
        onImagesUpload(validImages);
      }
    };
    
    validateInitialImages();
  }, [initialImages, retryTrigger]);

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
      // Télécharger les images vers le service distant directement
      const uploadedUrls = await Promise.all(
        validFiles.map(file => uploadImage(file))
      );
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        const allImages = [...previews, ...validUrls];
        setPreviews(allImages);
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
      
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    const removedUrl = newPreviews.splice(index, 1)[0];
    
    // Nettoyer le blob URL si c'en est un
    if (removedUrl && removedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedUrl);
    }
    
    setPreviews(newPreviews);
    
    // Mettre à jour les erreurs
    const newImageErrors = {...imageErrors};
    delete newImageErrors[index];
    
    // Recalculer les indices pour les erreurs restantes
    const updatedErrors: {[index: number]: boolean} = {};
    Object.keys(newImageErrors).forEach(key => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        updatedErrors[keyNum - 1] = true;
      } else {
        updatedErrors[keyNum] = true;
      }
    });
    
    setImageErrors(updatedErrors);
    onImagesUpload(newPreviews);
  };

  const retryAllImages = () => {
    setRetryTrigger(prev => prev + 1);
    toast.info("Nouvelle tentative de chargement des images...");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      
      {Object.keys(imageErrors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-amber-600 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Certaines images n'ont pas pu être chargées
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={retryAllImages}
              className="h-7 text-xs flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Réessayer
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={`${preview.substring(0, 20)}-${index}`} className="relative rounded-md overflow-hidden border border-gray-200 aspect-square">
            <img 
              src={`${preview}?t=${new Date().getTime()}`} // Ajouter timestamp pour éviter la mise en cache
              alt={`Image ${index + 1}`} 
              className="w-full h-full object-cover"
              onError={() => {
                console.error(`Erreur de chargement d'image à l'index ${index}:`, preview);
                setImageErrors(prev => ({...prev, [index]: true}));
              }}
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
            
            {imageErrors[index] && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={retryAllImages}
                  className="h-8 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Réessayer
                </Button>
              </div>
            )}
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
