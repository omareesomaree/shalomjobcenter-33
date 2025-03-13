
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { isImageUrlValid } from "@/services/imageService";
import "../../styles/components/logo.css";

export const NavbarLogo = () => {
  const { settings } = useSiteSettings();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string>("");
  
  // Fonction pour vérifier et charger le logo
  const loadLogo = async () => {
    try {
      let logoSrc = "";
      
      // Vérifier si le logo est stocké séparément
      if (settings.logo === 'stored_separately') {
        const storedLogo = localStorage.getItem('site_logo');
        if (storedLogo && await isValidImageSource(storedLogo)) {
          logoSrc = storedLogo;
          console.log("Logo chargé depuis le stockage séparé");
        } else {
          logoSrc = "/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png";
          console.log("Utilisation du logo par défaut (stockage séparé non valide)");
        }
      } else if (settings.logo && await isValidImageSource(settings.logo)) {
        logoSrc = settings.logo;
        console.log("Logo chargé depuis les paramètres:", logoSrc.substring(0, 30) + "...");
      } else {
        // Utiliser le logo par défaut téléchargé
        logoSrc = "/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png";
        console.log("Utilisation du logo par défaut");
      }
      
      setCurrentLogo(logoSrc);
      setLogoLoaded(false);
      setLogoError(false);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du logo:", error);
      setLogoError(true);
      // Utiliser le logo par défaut en cas d'erreur
      setCurrentLogo("/lovable-uploads/d5d07869-e401-4c49-8357-a89107918217.png");
    }
  };
  
  // Vérifier si une source d'image est valide
  const isValidImageSource = async (src: string): Promise<boolean> => {
    if (!src) return false;
    
    // Si c'est une URL http(s), vérifier si elle est valide
    if (src.startsWith('http')) {
      return await isImageUrlValid(src);
    }
    
    // Pour les data URLs ou autres formats
    return true;
  };
  
  // Charger le logo au chargement et quand les paramètres changent
  useEffect(() => {
    loadLogo();
  }, [settings.logo]);
  
  return (
    <Link to="/" className="flex items-center gap-4 sm:gap-6 md:gap-8 mr-8">
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5, z: 10 }}
        whileTap={{ scale: 0.95 }}
        className="relative logo-container"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <div className="h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 flex items-center justify-center overflow-hidden rounded-full bg-black border-2 border-yellow-500">
          {!logoError ? (
            <img 
              src={currentLogo} 
              alt={settings.siteName || "Logo"}
              className={`logo w-full h-full transition-all duration-300 ease-in-out ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={() => {
                console.error("Error loading logo:", currentLogo.substring(0, 30) + "...");
                setLogoError(true);
              }}
            />
          ) : null}
          
          {(!logoLoaded || logoError) && (
            <div className="h-full w-full rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center logo-fallback">
              <span className="text-yellow-500 font-bold text-lg">
                {settings.siteName ? settings.siteName.substring(0, 2).toUpperCase() : 'SJ'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
      <motion.span 
        className="text-xl sm:text-2xl md:text-3xl font-bold site-name inline-block font-serif tracking-wide truncate max-w-[180px] xs:max-w-[180px] sm:max-w-none" 
        whileHover={{ scale: 1.05 }}
      >
        {settings.siteName || 'Shalom Job Center'}
      </motion.span>
    </Link>
  );
};
