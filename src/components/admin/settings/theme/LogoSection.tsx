
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ImageUploader } from '@/components/shared/image-uploader';
import "../../../../styles/components/logo.css";

interface LogoSectionProps {
  logoUrl: string;
  logoUploading: boolean;
  handleLogoUpload: (imageUrl: string) => void;
}

export const LogoSection = ({ 
  logoUrl, 
  logoUploading, 
  handleLogoUpload 
}: LogoSectionProps) => {
  const { settings } = useSiteSettings();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [logoError, setLogoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  useEffect(() => {
    try {
      // Reset error state at the beginning
      setLogoError(false);
      setLogoLoaded(false);
      
      // Check if the logo is stored separately
      if (settings.logo === 'stored_separately') {
        const storedLogo = localStorage.getItem('site_logo');
        if (storedLogo) {
          console.log("Logo loaded from separate storage");
          setPreviewUrl(storedLogo);
        } else {
          console.log("No logo found in separate storage");
          setPreviewUrl(logoUrl || "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
        }
      } else {
        console.log("Using logo from settings");
        setPreviewUrl(settings.logo || logoUrl || "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
      }
    } catch (error) {
      console.error("Error loading logo:", error);
      setLogoError(true);
      toast.error("Error loading logo");
    }
  }, [settings.logo, logoUrl]);
  
  const handleLogoError = () => {
    console.error("Error loading logo preview");
    setLogoError(true);
    toast.error("Unable to display logo. Please try uploading again.");
  };
  
  const handleRetryLoad = () => {
    setLogoError(false);
    setLogoLoaded(false);
    
    // Force reload by setting a temporary empty value
    setPreviewUrl("");
    setTimeout(() => {
      if (settings.logo === 'stored_separately') {
        const storedLogo = localStorage.getItem('site_logo');
        setPreviewUrl(storedLogo || logoUrl || "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
      } else {
        setPreviewUrl(settings.logo || logoUrl || "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
      }
    }, 100);
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-1.5 mb-4">
        <Label htmlFor="logo">Logo du site</Label>
        <p className="text-sm text-muted-foreground">
          Téléchargez votre logo pour le site. Formats recommandés: PNG, SVG (transparent).
        </p>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="w-full sm:w-1/3">
          <CardContent className="p-4 flex items-center justify-center">
            <div className="w-32 h-32 mx-auto bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center overflow-hidden logo-container" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              {logoUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                  <span className="text-xs text-yellow-500">Chargement...</span>
                </div>
              ) : previewUrl && !logoError ? (
                <img 
                  src={previewUrl} 
                  alt="Logo du site" 
                  className={`w-full h-full object-cover logo ${logoLoaded ? '' : 'opacity-0'}`}
                  onError={handleLogoError}
                  onLoad={() => setLogoLoaded(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 logo-fallback rounded-full h-full w-full bg-black border-2 border-yellow-500 flex items-center justify-center">
                  <span className="text-yellow-500 font-bold text-xl">
                    {settings.siteName ? settings.siteName.substring(0, 2).toUpperCase() : 'SJ'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col justify-center space-y-4 w-full sm:w-2/3">
          {logoError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du chargement du logo. Veuillez essayer de télécharger à nouveau.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto" 
                onClick={handleRetryLoad}
              >
                Réessayer
              </Button>
            </Alert>
          )}
          
          <div className="flex items-center gap-4">
            <ImageUploader
              initialImage={previewUrl}
              onImageUpload={handleLogoUpload}
              label=""
              maxSizeMB={2}
            />
            
            <div className="text-sm text-muted-foreground">
              Formats supportés: JPG, PNG, GIF, SVG. Taille max: 2MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
