
import { toast } from "sonner";

/**
 * Service d'hébergement d'images en ligne
 * Utilise ImgBB comme service d'hébergement gratuit
 */

// Clé API ImgBB (gratuite avec limite)
const IMGBB_API_KEY = "b9e63abb602a9a3d7e7e9ce574c3ff12"; // Clé API publique avec limites de trafic

/**
 * Télécharge une image vers ImgBB
 * @param imageFile Image à télécharger (File ou Blob)
 * @returns URL de l'image téléchargée ou null en cas d'erreur
 */
export const uploadImage = async (imageFile: File | Blob): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("key", IMGBB_API_KEY);

    // Ajouter un paramètre pour éviter la mise en cache par le navigateur
    const timestamp = new Date().getTime();
    
    const response = await fetch(`https://api.imgbb.com/1/upload?t=${timestamp}`, {
      method: "POST",
      body: formData,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Utiliser l'URL direct plutôt que l'URL d'affichage
      console.log("Image téléchargée avec succès:", data.data.url);
      return data.data.url;
    } else {
      throw new Error("Échec du téléchargement de l'image");
    }
  } catch (error) {
    console.error("Erreur de téléchargement d'image:", error);
    toast.error("Échec du téléchargement de l'image. Réessayez avec une image plus petite.");
    return null;
  }
};

/**
 * Télécharge une image en base64 vers ImgBB
 * @param base64Image Image en format base64
 * @returns URL de l'image téléchargée ou null en cas d'erreur
 */
export const uploadBase64Image = async (base64Image: string): Promise<string | null> => {
  try {
    // Enlever l'en-tête data:image si présent
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const formData = new FormData();
    formData.append("image", base64Data);
    formData.append("key", IMGBB_API_KEY);

    // Ajouter un paramètre pour éviter la mise en cache
    const timestamp = new Date().getTime();

    const response = await fetch(`https://api.imgbb.com/1/upload?t=${timestamp}`, {
      method: "POST",
      body: formData,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log("Image base64 téléchargée avec succès:", data.data.url);
      return data.data.url;
    } else {
      throw new Error("Échec du téléchargement de l'image base64");
    }
  } catch (error) {
    console.error("Erreur de téléchargement d'image base64:", error);
    toast.error("Échec du téléchargement de l'image");
    return null;
  }
};

/**
 * Télécharge plusieurs images vers ImgBB
 * @param images Tableau d'images à télécharger (Files ou URLs base64)
 * @returns Tableau d'URLs des images téléchargées
 */
export const uploadMultipleImages = async (
  images: Array<File | string>
): Promise<string[]> => {
  const uploadPromises = images.map(async (image) => {
    if (typeof image === "string") {
      // Si c'est déjà une URL HTTP, la retourner telle quelle
      if (image.startsWith("http")) {
        return image;
      }
      // Sinon, c'est une image base64
      return await uploadBase64Image(image) || "";
    } else {
      // C'est un fichier
      return await uploadImage(image) || "";
    }
  });

  try {
    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls.filter(url => url !== ""); // Filtrer les échecs
  } catch (error) {
    console.error("Erreur lors du téléchargement multiple:", error);
    toast.error("Certaines images n'ont pas pu être téléchargées");
    return [];
  }
};

/**
 * Vérifie si une URL d'image est valide
 */
export const isImageUrlValid = async (url: string): Promise<boolean> => {
  if (!url || !url.startsWith('http')) return false;
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Erreur de vérification d'URL:", error);
    return false;
  }
};
