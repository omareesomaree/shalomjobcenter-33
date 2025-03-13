import { createContext, useContext, useEffect } from 'react';
import { useSettingsStorage } from './settings/useSettingsStorage';
import { SiteSettings } from '@/types/siteSettings';
import { isImageUrlValid } from '@/services/imageService';

interface SiteSettingsContextProps {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => boolean;
  importSettings: (file: File) => Promise<boolean>;
  applySettingsToDOM: (settingsToApply: SiteSettings) => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextProps | undefined>(undefined);

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings, resetSettings } = useSettingsStorage();

  // Appliquer les paramètres au DOM
  useEffect(() => {
    applySettingsToDOM(settings);
  }, [settings]);

  // Exporter les paramètres au format JSON
  const exportSettings = () => {
    try {
      const settingsJSON = JSON.stringify(settings, null, 2);
      const blob = new Blob([settingsJSON], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = href;
      link.download = 'site-settings.json';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'exportation des paramètres:", error);
      return false;
    }
  };

  // Importer les paramètres depuis un fichier JSON
  const importSettings = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            
            // Vérifier les URL d'images
            if (importedSettings.logo && importedSettings.logo.startsWith('http')) {
              const isValid = await isImageUrlValid(importedSettings.logo);
              if (!isValid) {
                console.warn("L'URL du logo importé n'est pas accessible");
                // Utiliser le logo par défaut
                importedSettings.logo = "/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png";
              }
            }
            
            if (importedSettings.favicon && importedSettings.favicon.startsWith('http')) {
              const isValid = await isImageUrlValid(importedSettings.favicon);
              if (!isValid) {
                console.warn("L'URL du favicon importé n'est pas accessible");
                // Utiliser le favicon par défaut
                importedSettings.favicon = "/favicon.ico";
              }
            }
            
            updateSettings(importedSettings);
            applySettingsToDOM(importedSettings);
            resolve(true);
          } catch (parseError) {
            console.error("Erreur lors de l'analyse du fichier importé:", parseError);
            resolve(false);
          }
        };
        
        reader.onerror = () => {
          console.error("Erreur lors de la lecture du fichier");
          resolve(false);
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error("Erreur lors de l'importation des paramètres:", error);
        resolve(false);
      }
    });
  };

  // Appliquer les paramètres au DOM
  const applySettingsToDOM = async (settingsToApply: SiteSettings) => {
    try {
      // Mettre à jour le titre du document
      if (settingsToApply.siteName) {
        document.title = settingsToApply.siteName;
      }
      
      // Mettre à jour le favicon
      if (settingsToApply.favicon) {
        let faviconUrl = settingsToApply.favicon;
        
        // Vérifier si le favicon est accessible
        if (faviconUrl.startsWith('http')) {
          const isValid = await isImageUrlValid(faviconUrl);
          if (!isValid) {
            console.warn("L'URL du favicon n'est pas accessible:", faviconUrl);
            // Récupérer depuis localStorage
            const storedFavicon = localStorage.getItem('site_favicon');
            if (storedFavicon && await isImageUrlValid(storedFavicon)) {
              faviconUrl = storedFavicon;
            } else {
              faviconUrl = "/favicon.ico";
            }
          }
        }
        
        // Mettre à jour le favicon
        const faviconLink = document.querySelector('link[rel="icon"]');
        if (faviconLink) {
          faviconLink.setAttribute('href', `${faviconUrl}?v=${new Date().getTime()}`);
        } else {
          const newFaviconLink = document.createElement('link');
          newFaviconLink.setAttribute('rel', 'icon');
          newFaviconLink.setAttribute('href', `${faviconUrl}?v=${new Date().getTime()}`);
          document.head.appendChild(newFaviconLink);
        }
      }
      
      // Appliquer les couleurs primaires et secondaires comme variables CSS
      if (settingsToApply.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', settingsToApply.primaryColor);
      }
      
      if (settingsToApply.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', settingsToApply.secondaryColor);
      }

      // Appliquer d'autres paramètres visuels...
      
      console.log("Paramètres appliqués au DOM avec succès");
    } catch (error) {
      console.error("Erreur lors de l'application des paramètres au DOM:", error);
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
        applySettingsToDOM,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};
