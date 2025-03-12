
import React from 'react';
import { SiteSettings } from '@/types/siteSettings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Import our new components
import { LogoSection } from './theme/LogoSection';
import { FaviconSection } from './theme/FaviconSection';
import { ColorSettings } from './theme/ColorSettings';
import { TypographySettings } from './theme/TypographySettings';
import { DisplaySettings } from './theme/DisplaySettings';

interface ThemeSettingsTabProps {
  settings: SiteSettings;
  logoUrl: string;
  logoUploading: boolean;
  faviconUrl: string;
  faviconUploading: boolean;
  handleLogoUpload: (imageUrl: string) => void;
  handleFaviconUpload: (imageUrl: string) => void;
  handleThemeColorChange: (type: 'primaryColor' | 'secondaryColor', color: string) => void;
  handleInputChange: (field: keyof SiteSettings, value: any) => void;
}

export const ThemeSettingsTab: React.FC<ThemeSettingsTabProps> = ({
  settings,
  logoUrl,
  logoUploading,
  faviconUrl,
  faviconUploading,
  handleLogoUpload,
  handleFaviconUpload,
  handleThemeColorChange,
  handleInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du thème</CardTitle>
        <CardDescription>Personnalisez l'apparence de votre site.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Logo</Label>
            <LogoSection 
              logoUrl={logoUrl}
              logoUploading={logoUploading}
              handleLogoUpload={handleLogoUpload}
            />
          </div>
          <div>
            <Label>Favicon</Label>
            <FaviconSection 
              faviconUrl={faviconUrl}
              faviconUploading={faviconUploading}
              handleFaviconUpload={handleFaviconUpload}
            />
          </div>
        </div>
        
        <ColorSettings 
          settings={settings}
          handleThemeColorChange={handleThemeColorChange}
        />
        
        <TypographySettings 
          settings={settings}
          handleInputChange={handleInputChange}
        />
        
        <DisplaySettings 
          settings={settings}
          handleInputChange={handleInputChange}
        />
      </CardContent>
    </Card>
  );
};
