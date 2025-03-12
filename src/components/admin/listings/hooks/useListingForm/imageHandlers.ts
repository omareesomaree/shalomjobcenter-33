
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { uploadMultipleImages } from "@/services/imageService";

export const useImageHandlers = (initialImages: string[] = []) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  // Charger les images initiales
  useEffect(() => {
    // Si des images sont fournies, les utiliser
    if (initialImages && initialImages.length > 0) {
      // Ne garder que les URLs HTTP valides
      const validImages = initialImages.filter(img => 
        img && typeof img === 'string' && img.startsWith('http')
      );
      setImagePreviews(validImages);
      console.log("Images initiales chargées:", validImages);
    }
  }, [initialImages]);
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      const filesArray = Array.from(e.target.files);
      
      try {
        // Télécharger les images vers le service d'hébergement
        const uploadedUrls = await uploadMultipleImages(filesArray);
        
        // Ajouter les nouvelles URLs aux existantes
        setImagePreviews(prevPreviews => [...prevPreviews, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) ajoutée(s)`);
      } catch (error) {
        console.error('Erreur lors du téléchargement des images:', error);
        toast.error("Erreur lors du téléchargement des images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImagesUpload = (imageUrls: string[]) => {
    setImagePreviews(imageUrls);
  };

  const removeImage = (index: number) => {
    setImagePreviews(prevPreviews => {
      const updatedPreviews = prevPreviews.filter((_, i) => i !== index);
      toast.success("Image supprimée");
      return updatedPreviews;
    });
  };

  const resetImages = () => {
    setImagePreviews([]);
    toast.success("Toutes les images ont été supprimées");
  };

  return {
    images: [], // Deprecated, using imagePreviews directly
    imagePreviews,
    isUploading,
    handleImageChange,
    handleImagesUpload,
    removeImage,
    resetImages
  };
};
