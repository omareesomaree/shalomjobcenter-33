import { useState, useCallback, useRef, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SiteSettings } from '@/types/siteSettings';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { uploadBase64Image, isImageUrlValid } from '@/services/imageService';

export function useAdminSettings() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSiteSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [logoUrl, setLogoUrl] = useState<string>(settings.logo || "/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png");
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string>(settings.favicon || "/favicon.ico");
  const [faviconUploading, setFaviconUploading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkImageUrls = async () => {
      if (settings.logo && settings.logo.startsWith('http')) {
        const isLogoValid = await isImageUrlValid(settings.logo);
        if (!isLogoValid) {
          console.warn("URL de logo invalide:", settings.logo);
          setLogoUrl("/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png");
        } else {
          setLogoUrl(settings.logo);
        }
      } else if (settings.logo) {
        setLogoUrl(settings.logo);
      }
      
      if (settings.favicon && settings.favicon.startsWith('http')) {
        const isFaviconValid = await isImageUrlValid(settings.favicon);
        if (!isFaviconValid) {
          console.warn("URL de favicon invalide:", settings.favicon);
          setFaviconUrl("/favicon.ico");
        } else {
          setFaviconUrl(settings.favicon);
        }
      } else if (settings.favicon) {
        setFaviconUrl(settings.favicon);
      }
    };
    
    checkImageUrls();
  }, [settings.logo, settings.favicon]);

  const handleLogoUpload = useCallback(async (imageUrl: string) => {
    if (!imageUrl) {
      toast.error("Aucune image sélectionnée pour le logo");
      return;
    }
    
    setLogoUploading(true);
    
    try {
      if (imageUrl.startsWith('http')) {
        const isValid = await isImageUrlValid(imageUrl);
        if (!isValid) {
          throw new Error("L'URL du logo n'est pas accessible");
        }
        
        updateSettings({ logo: imageUrl });
        setLogoUrl(imageUrl);
        toast.success("Logo mis à jour avec succès");
        
        localStorage.setItem('site_logo', imageUrl);
        return;
      }
      
      const uploadedUrl = await uploadBase64Image(imageUrl);
      
      if (uploadedUrl) {
        updateSettings({ logo: uploadedUrl });
        setLogoUrl(uploadedUrl);
        
        localStorage.setItem('site_logo', uploadedUrl);
        
        toast.success("Logo téléchargé et mis à jour avec succès");
      } else {
        throw new Error("Échec du téléchargement du logo");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du logo:", error);
      toast.error("Échec de la mise à jour du logo");
    } finally {
      setLogoUploading(false);
    }
  }, [updateSettings]);

  const handleFaviconUpload = useCallback(async (imageUrl: string) => {
    if (!imageUrl) {
      toast.error("Aucune image sélectionnée pour le favicon");
      return;
    }
    
    setFaviconUploading(true);
    
    try {
      if (imageUrl.startsWith('http')) {
        const isValid = await isImageUrlValid(imageUrl);
        if (!isValid) {
          throw new Error("L'URL du favicon n'est pas accessible");
        }
        
        updateSettings({ favicon: imageUrl });
        setFaviconUrl(imageUrl);
        
        localStorage.setItem('site_favicon', imageUrl);
        
        toast.success("Favicon mis à jour avec succès");
        return;
      }
      
      const uploadedUrl = await uploadBase64Image(imageUrl);
      
      if (uploadedUrl) {
        updateSettings({ favicon: uploadedUrl });
        setFaviconUrl(uploadedUrl);
        
        localStorage.setItem('site_favicon', uploadedUrl);
        
        const faviconLink = document.querySelector('link[rel="icon"]');
        if (faviconLink) {
          faviconLink.setAttribute('href', uploadedUrl);
        }
        
        toast.success("Favicon téléchargé et mis à jour avec succès");
      } else {
        throw new Error("Échec du téléchargement du favicon");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favicon:", error);
      toast.error("Échec de la mise à jour du favicon");
    } finally {
      setFaviconUploading(false);
    }
  }, [updateSettings]);

  const handleImportClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const success = await importSettings(file);

    if (success) {
      toast.success("Paramètres importés avec succès");
    } else {
      toast.error("Échec de l'importation des paramètres");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importSettings]);

  const handleSettingsExport = useCallback(() => {
    const success = exportSettings();
    if (success) {
      toast.success("Paramètres exportés avec succès");
    } else {
      toast.error("Échec de l'exportation des paramètres");
    }
  }, [exportSettings]);

  const handleThemeColorChange = useCallback((type: 'primaryColor' | 'secondaryColor', color: string) => {
    updateSettings({ [type]: color });
    toast.success(`Couleur ${type === 'primaryColor' ? 'principale' : 'secondaire'} mise à jour`);
  }, [updateSettings]);

  const handleInputChange = useCallback((field: keyof SiteSettings, value: any) => {
    updateSettings({ [field]: value });
  }, [updateSettings]);

  const handleFooterChange = useCallback((field: keyof SiteSettings['footer'], value: string) => {
    updateSettings({
      footer: { ...settings.footer, [field]: value }
    });
  }, [settings.footer, updateSettings]);

  const handleCompanyInfoChange = useCallback((field: keyof SiteSettings['companyInfo'], value: string) => {
    updateSettings({
      companyInfo: { ...settings.companyInfo, [field]: value }
    });
  }, [settings.companyInfo, updateSettings]);

  const handleSocialLinkChange = useCallback((field: keyof SiteSettings['socialLinks'], value: string) => {
    updateSettings({
      socialLinks: { ...settings.socialLinks, [field]: value }
    });
  }, [settings.socialLinks, updateSettings]);

  const handleReset = useCallback(() => {
    resetSettings();
    
    const defaultLogo = "/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png";
    const defaultFavicon = "/favicon.ico";
    setLogoUrl(defaultLogo);
    setFaviconUrl(defaultFavicon);
    
    toast.success("Paramètres réinitialisés avec succès");
  }, [resetSettings]);
  
  const goBackToDashboard = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  return {
    settings,
    activeTab,
    setActiveTab,
    logoUrl,
    logoUploading,
    faviconUrl,
    faviconUploading,
    fileInputRef,
    handleLogoUpload,
    handleFaviconUpload,
    handleImportClick,
    handleFileChange,
    handleSettingsExport,
    handleThemeColorChange,
    handleInputChange,
    handleFooterChange,
    handleCompanyInfoChange,
    handleSocialLinkChange,
    handleReset,
    goBackToDashboard
  };
}
