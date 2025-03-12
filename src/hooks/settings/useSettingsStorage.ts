
import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types/siteSettings';
import { defaultSettings } from './useSettingsDefaults';

export const useSettingsStorage = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings as SiteSettings);

  // Charger les paramètres au démarrage
  useEffect(() => {
    try {
      // Récupérer les paramètres principaux
      const storedSettings = localStorage.getItem('siteSettings');
      let parsedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
      
      // S'assurer que le mode sombre est toujours désactivé
      parsedSettings.darkMode = false;
      
      setSettings(parsedSettings as SiteSettings);
      console.log("Paramètres chargés avec succès", parsedSettings);
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    }
  }, []);

  // Sauvegarder les paramètres à chaque modification
  useEffect(() => {
    try {
      // Sauvegarder directement dans localStorage
      const settingsToStore = { ...settings, darkMode: false };
      localStorage.setItem('siteSettings', JSON.stringify(settingsToStore));
      console.log("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prevSettings) => {
      // S'assurer que le mode sombre reste désactivé
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        darkMode: false
      };
      console.log("Paramètres mis à jour:", updatedSettings);
      return updatedSettings;
    });
  };

  const resetSettings = () => {
    setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    console.log("Paramètres réinitialisés");
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};
