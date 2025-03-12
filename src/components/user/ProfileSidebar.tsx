
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { User as UserType } from '@/hooks/useAuth';
import { ImageUploader } from '@/components/shared/image-uploader';
import { toast } from 'sonner';
import { uploadBase64Image } from '@/services/imageService';

interface ProfileSidebarProps {
  user: UserType | null;
  onAvatarChange?: (avatarUrl: string) => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, onAvatarChange }) => {
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || "/placeholder.svg");
  const [isUploading, setIsUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Clé unique pour forcer le rechargement de l'image

  // Mise à jour de l'avatar local lorsque user?.avatar change
  useEffect(() => {
    if (user?.avatar && user.avatar !== avatar) {
      setAvatar(user.avatar);
      setAvatarKey(Date.now()); // Force refresh when avatar changes
    }
  }, [user?.avatar]);

  const handleAvatarChange = (imageUrl: string) => {
    if (!imageUrl) return;
    
    setAvatar(imageUrl);
    setAvatarKey(Date.now()); // Générer une nouvelle clé pour forcer le rechargement
    
    // Immediately display the new avatar
    document.querySelectorAll('.user-avatar-display').forEach((el) => {
      (el as HTMLImageElement).src = imageUrl;
      (el as HTMLImageElement).setAttribute('key', String(Date.now()));
    });
    
    // Save to localStorage to persist across refreshes
    localStorage.setItem('userAvatar', imageUrl);
    
    // Notifier le composant parent du changement d'avatar
    if (onAvatarChange) {
      onAvatarChange(imageUrl);
    }
    
    toast.success("Photo de profil mise à jour avec succès");
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto relative mb-4 group">
          <div className="h-36 w-36 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md">
            <img 
              key={avatarKey}
              src={avatar} 
              alt={user?.name || "Utilisateur"}
              className="user-avatar-display"
            />
          </div>
          <div className="absolute -bottom-2 right-1/3 bg-white rounded-full p-1 shadow-sm">
            <ImageUploader
              initialImage={avatar}
              onImageUpload={handleAvatarChange}
              label="Photo de profil"
              maxSizeMB={5}
            />
          </div>
        </div>
        <CardTitle className="text-white">{user?.name || "Utilisateur"}</CardTitle>
        <CardDescription className="text-blue-100">Membre depuis {new Date().toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <User className="h-4 w-4 text-blue-600" />
          <span>{user?.name || "Non spécifié"}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <Mail className="h-4 w-4 text-blue-600" />
          <span>{user?.email || "email@exemple.com"}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>+228 XX XX XX XX</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Lomé, Togo</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span>Inscrit le {new Date().toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-blue-500 text-blue-700 hover:bg-blue-50">Modifier mon profil</Button>
      </CardFooter>
    </Card>
  );
};
