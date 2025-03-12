
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '@/components/shared/image-uploader/ImageUploader';
import { EyeIcon, Megaphone } from 'lucide-react';
import { StatusMessage } from '../types';
import { StatusPreview } from './StatusPreview';
import { getTypeIcon } from '../utils/statusUtils';

interface StatusFormProps {
  handlePublish: (status: Omit<StatusMessage, 'id' | 'createdAt' | 'active'>) => void;
}

export const StatusForm: React.FC<StatusFormProps> = ({ handlePublish }) => {
  const [newStatusText, setNewStatusText] = useState('');
  const [statusType, setStatusType] = useState<'announcement' | 'promotion' | 'info' | 'alert'>('announcement');
  const [statusImage, setStatusImage] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f97316'); // Default orange color
  const [textColor, setTextColor] = useState('#ffffff'); // Default white text
  const [isPreview, setIsPreview] = useState(false);

  // Updated to accept a string URL from the ImageUploader
  const handleImageUpload = (imageUrl: string) => {
    setStatusImage(imageUrl);
  };

  const onPublish = () => {
    handlePublish({
      text: newStatusText.trim(),
      imageUrl: statusImage,
      type: statusType,
      backgroundColor,
      textColor
    });
    
    // Reset form
    setNewStatusText('');
    setStatusImage(undefined);
    setIsPreview(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="status-text">Texte du statut</Label>
            <Textarea
              id="status-text"
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              placeholder="Saisissez votre annonce ici..."
              className="h-32"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bg-color">Couleur de fond</Label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="color" 
                  id="bg-color" 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 border-0 rounded-md"
                />
                <span className="text-sm text-gray-500">{backgroundColor}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="text-color">Couleur du texte</Label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="color" 
                  id="text-color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 border-0 rounded-md"
                />
                <span className="text-sm text-gray-500">{textColor}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="status-type">Type de statut</Label>
            <select
              id="status-type"
              value={statusType}
              onChange={(e) => setStatusType(e.target.value as any)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="announcement">Annonce</option>
              <option value="promotion">Promotion</option>
              <option value="info">Information</option>
              <option value="alert">Alerte</option>
            </select>
          </div>
        </div>
        
        <div>
          <Label className="block mb-2">Image (optionnelle)</Label>
          <ImageUploader
            initialImage={statusImage}
            onImageUpload={handleImageUpload}
            label="Ajouter une image"
            className="w-full h-32"
            maxSizeMB={2}
          />
        </div>
      </div>
      
      {isPreview && (
        <div className="mt-4">
          <Label className="block mb-2">Aperçu</Label>
          <StatusPreview
            text={newStatusText}
            icon={getTypeIcon(statusType)}
            backgroundColor={backgroundColor}
            textColor={textColor}
            imageUrl={statusImage}
          />
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setIsPreview(!isPreview)}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          {isPreview ? "Masquer l'aperçu" : "Aperçu"}
        </Button>
        <Button 
          onClick={onPublish}
          disabled={!newStatusText.trim()}
        >
          <Megaphone className="h-4 w-4 mr-2" />
          Publier
        </Button>
      </div>
    </div>
  );
};
