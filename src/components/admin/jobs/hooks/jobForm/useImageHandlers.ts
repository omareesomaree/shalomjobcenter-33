
import { toast } from "sonner";
import { uploadImage, uploadBase64Image, uploadMultipleImages } from "@/services/imageService";

export interface UseImageHandlersParams {
  images: string[];
  setImages: (value: string[]) => void;
  setFeaturedImage: (value: string) => void;
  setIsUploading: (value: boolean) => void;
}

export const useImageHandlers = ({
  images,
  setImages,
  setFeaturedImage,
  setIsUploading
}: UseImageHandlersParams) => {
  
  // Gère le téléchargement d'image principale
  const handleFeaturedImageUpload = (isHousingOffer: boolean) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      
      // Validation de la taille
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }
      
      setIsUploading(true);
      
      try {
        // Télécharger vers le service d'hébergement
        const uploadedUrl = await uploadImage(file);
        
        if (uploadedUrl) {
          setFeaturedImage(uploadedUrl);
          toast.success("Image principale téléchargée avec succès");
        } else {
          throw new Error("Échec du téléchargement de l'image");
        }
      } catch (error) {
        console.error("Erreur de téléchargement:", error);
        toast.error("Échec du téléchargement de l'image");
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  // Gère l'ajout d'une image additionnelle
  const handleAddImage = (isHousingOffer: boolean) => {
    // Limiter le nombre d'images à 3
    if (images.length >= 3) {
      toast.warning("Maximum 3 images autorisées");
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      
      // Validation de la taille
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }
      
      setIsUploading(true);
      
      try {
        // Télécharger vers le service d'hébergement
        const uploadedUrl = await uploadImage(file);
        
        if (uploadedUrl) {
          setImages([...images, uploadedUrl]);
          toast.success("Image additionnelle téléchargée avec succès");
        } else {
          throw new Error("Échec du téléchargement de l'image");
        }
      } catch (error) {
        console.error("Erreur de téléchargement:", error);
        toast.error("Échec du téléchargement de l'image");
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  // Supprime une image à un index spécifique
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    toast.success("Image supprimée");
  };

  // Supprime toutes les images
  const handleClearAllImages = () => {
    setImages([]);
    toast.success("Toutes les images ont été supprimées");
  };

  return {
    handleFeaturedImageUpload,
    handleAddImage,
    handleRemoveImage,
    handleClearAllImages
  };
};
