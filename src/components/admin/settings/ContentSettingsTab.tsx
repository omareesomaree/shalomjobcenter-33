import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUploader } from '@/components/shared/image-uploader'; 
import { useContentManagement } from './hooks/useContentManagement';
import { Save, Plus, Trash2, Edit, Check, X, Globe, FileText, Menu } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ContentSettingsTab: React.FC = () => {
  const {
    content,
    activePageId,
    setActivePageId,
    activeSectionId,
    setActiveSectionId,
    activePublicationId,
    setActivePublicationId,
    isEditing,
    setIsEditing,
    updatePageSection,
    updateNavItem,
    updatePublication,
    addPageSection,
    addNavItem,
    addPublication,
    deletePageSection,
    deleteNavItem,
    deletePublication
  } = useContentManagement();

  const [imageUploading, setImageUploading] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<string>("pages");
  const [editedSectionContent, setEditedSectionContent] = useState<string>("");
  const [editedNavItem, setEditedNavItem] = useState<{
    label: string;
    url: string;
    order: number;
  }>({ label: "", url: "", order: 0 });
  const [editedPublication, setEditedPublication] = useState<{
    title: string;
    content: string;
    excerpt: string;
  }>({ title: "", content: "", excerpt: "" });
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    content: "",
    type: "text" as "text" | "richtext" | "image"
  });
  const [showAddNavForm, setShowAddNavForm] = useState(false);
  const [showAddPublicationForm, setShowAddPublicationForm] = useState(false);
  const [newPublication, setNewPublication] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    featured: false
  });

  const handleImageUpload = (imageUrl: string) => {
    if (!imageUrl) return;
    
    // Update the relevant content with the new image URL
    if (activeContentTab === "pages" && activeSectionId) {
      updatePageSection(activePageId, activeSectionId, { imageUrl });
    } else if (activeContentTab === "publications" && activePublicationId) {
      updatePublication(activePublicationId, { image: imageUrl });
    }
  };

  const startEditing = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const section = content.pages[activePageId].sections.find(s => s.id === sectionId);
    if (section) {
      setEditedSectionContent(section.content);
      setIsEditing(true);
    }
  };

  const startEditingNav = (navId: string) => {
    const navItem = content.navigation.find(n => n.id === navId);
    if (navItem) {
      setEditedNavItem({
        label: navItem.label,
        url: navItem.url,
        order: navItem.order
      });
      setActiveSectionId(navId);
      setIsEditing(true);
    }
  };

  const startEditingPublication = (pubId: string) => {
    const pub = content.publications.find(p => p.id === pubId);
    if (pub) {
      setEditedPublication({
        title: pub.title,
        content: pub.content,
        excerpt: pub.excerpt
      });
      setActivePublicationId(pubId);
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    if (activeContentTab === "pages" && activeSectionId) {
      updatePageSection(activePageId, activeSectionId, { content: editedSectionContent });
    } else if (activeContentTab === "navigation" && activeSectionId) {
      updateNavItem(activeSectionId, editedNavItem);
    } else if (activeContentTab === "publications" && activePublicationId) {
      updatePublication(activePublicationId, editedPublication);
    }
    
    setIsEditing(false);
    setActiveSectionId("");
    setActivePublicationId("");
  };

  const cancelEdits = () => {
    setIsEditing(false);
    setActiveSectionId("");
    setActivePublicationId("");
  };

  const handleAddSection = () => {
    if (newSection.title && newSection.content) {
      addPageSection(activePageId, {
        id: `section-${Date.now()}`,
        title: newSection.title,
        content: newSection.content,
        type: newSection.type
      });
      setNewSection({ title: "", content: "", type: "text" });
      setShowAddSectionForm(false);
    }
  };

  const handleAddNavItem = () => {
    if (editedNavItem.label && editedNavItem.url) {
      addNavItem({
        label: editedNavItem.label,
        url: editedNavItem.url,
        order: editedNavItem.order || content.navigation.length + 1
      });
      setEditedNavItem({ label: "", url: "", order: 0 });
      setShowAddNavForm(false);
    }
  };

  const handleAddPublication = () => {
    if (newPublication.title && newPublication.content) {
      addPublication({
        title: newPublication.title,
        slug: newPublication.slug || newPublication.title.toLowerCase().replace(/\s+/g, '-'),
        content: newPublication.content,
        excerpt: newPublication.excerpt,
        publishDate: new Date().toISOString().split('T')[0],
        author: newPublication.author || "Admin",
        featured: newPublication.featured,
        image: "/placeholder.svg"
      });
      setNewPublication({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        author: "",
        featured: false
      });
      setShowAddPublicationForm(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion du contenu du site</CardTitle>
        <CardDescription>
          Modifiez les textes, images, menus et publications de votre site web
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="publications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Publications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <div className="flex space-x-4">
              <div className="w-1/3 pr-4 border-r">
                <Label>Sélectionner une page</Label>
                <Select value={activePageId} onValueChange={setActivePageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une page" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(content.pages).map(pageId => (
                      <SelectItem key={pageId} value={pageId}>
                        {content.pages[pageId].title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-2/3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Sections de la page {content.pages[activePageId]?.title}</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddSectionForm(true)}
                    disabled={isEditing || showAddSectionForm}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter une section
                  </Button>
                </div>

                {showAddSectionForm && (
                  <Card className="mb-4 p-4 border-dashed border-2">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="new-section-title">Titre de la section</Label>
                        <Input 
                          id="new-section-title"
                          value={newSection.title}
                          onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-section-type">Type de contenu</Label>
                        <Select 
                          value={newSection.type} 
                          onValueChange={(value: "text" | "richtext" | "image") => 
                            setNewSection({...newSection, type: value})
                          }
                        >
                          <SelectTrigger id="new-section-type">
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texte simple</SelectItem>
                            <SelectItem value="richtext">Texte enrichi</SelectItem>
                            <SelectItem value="image">Image avec texte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-section-content">Contenu</Label>
                        <Textarea 
                          id="new-section-content"
                          value={newSection.content}
                          onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowAddSectionForm(false)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleAddSection}
                          disabled={!newSection.title || !newSection.content}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {content.pages[activePageId]?.sections.map(section => (
                  <Card key={section.id} className="mb-4 overflow-hidden">
                    <CardHeader className="bg-muted/50 py-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <div className="flex space-x-1">
                          {isEditing && activeSectionId === section.id ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={saveEdits}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={cancelEdits}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => startEditing(section.id)}
                                disabled={isEditing}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deletePageSection(activePageId, section.id)}
                                disabled={isEditing}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {isEditing && activeSectionId === section.id ? (
                        <Textarea 
                          value={editedSectionContent} 
                          onChange={(e) => setEditedSectionContent(e.target.value)}
                          rows={5}
                        />
                      ) : (
                        <div>
                          {section.type === "image" && section.imageUrl && (
                            <div className="mb-2">
                              <img 
                                src={section.imageUrl} 
                                alt={section.title} 
                                className="max-h-40 object-cover rounded"
                              />
                            </div>
                          )}
                          <p className="whitespace-pre-line">{section.content}</p>
                        </div>
                      )}

                      {section.type === "image" && activeSectionId === section.id && isEditing && (
                        <div className="mt-4">
                          <Label className="mb-2">Image de la section</Label>
                          <ImageUploader
                            initialImage={section.imageUrl || ""}
                            onImageUpload={handleImageUpload}
                            label="Image de section"
                            maxSizeMB={2}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Éléments du menu</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditedNavItem({ label: "", url: "", order: content.navigation.length + 1 });
                  setShowAddNavForm(true);
                }}
                disabled={isEditing || showAddNavForm}
              >
                <Plus className="h-4 w-4 mr-2" /> Ajouter un lien
              </Button>
            </div>

            {showAddNavForm && (
              <Card className="mb-4 p-4 border-dashed border-2">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-nav-label">Libellé</Label>
                    <Input 
                      id="new-nav-label"
                      value={editedNavItem.label}
                      onChange={(e) => setEditedNavItem({...editedNavItem, label: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-nav-url">URL</Label>
                    <Input 
                      id="new-nav-url"
                      value={editedNavItem.url}
                      onChange={(e) => setEditedNavItem({...editedNavItem, url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-nav-order">Ordre</Label>
                    <Input 
                      id="new-nav-order"
                      type="number"
                      value={editedNavItem.order}
                      onChange={(e) => setEditedNavItem({...editedNavItem, order: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddNavForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddNavItem}
                      disabled={!editedNavItem.label || !editedNavItem.url}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-2">
              {content.navigation
                .sort((a, b) => a.order - b.order)
                .map(navItem => (
                  <Card key={navItem.id} className="overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      {isEditing && activeSectionId === navItem.id ? (
                        <div className="grid grid-cols-12 gap-2 w-full items-center">
                          <div className="col-span-5">
                            <Input 
                              value={editedNavItem.label} 
                              onChange={(e) => setEditedNavItem({...editedNavItem, label: e.target.value})}
                              placeholder="Libellé"
                            />
                          </div>
                          <div className="col-span-5">
                            <Input 
                              value={editedNavItem.url} 
                              onChange={(e) => setEditedNavItem({...editedNavItem, url: e.target.value})}
                              placeholder="URL"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="number"
                              value={editedNavItem.order} 
                              onChange={(e) => setEditedNavItem({...editedNavItem, order: parseInt(e.target.value)})}
                              placeholder="Ordre"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-2 w-full items-center">
                          <div className="col-span-5 font-medium">{navItem.label}</div>
                          <div className="col-span-5 text-muted-foreground truncate">{navItem.url}</div>
                          <div className="col-span-2 text-center text-sm text-muted-foreground">
                            Ordre: {navItem.order}
                          </div>
                        </div>
                      )}

                      <div className="flex ml-4">
                        {isEditing && activeSectionId === navItem.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={saveEdits}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdits}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEditingNav(navItem.id)}
                              disabled={isEditing}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteNavItem(navItem.id)}
                              disabled={isEditing}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="publications" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Publications et articles</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddPublicationForm(true)}
                disabled={isEditing || showAddPublicationForm}
              >
                <Plus className="h-4 w-4 mr-2" /> Nouvelle publication
              </Button>
            </div>

            {showAddPublicationForm && (
              <Card className="mb-4 p-4 border-dashed border-2">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-pub-title">Titre</Label>
                    <Input 
                      id="new-pub-title"
                      value={newPublication.title}
                      onChange={(e) => setNewPublication({...newPublication, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-pub-excerpt">Extrait</Label>
                    <Input 
                      id="new-pub-excerpt"
                      value={newPublication.excerpt}
                      onChange={(e) => setNewPublication({...newPublication, excerpt: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-pub-content">Contenu</Label>
                    <Textarea 
                      id="new-pub-content"
                      value={newPublication.content}
                      onChange={(e) => setNewPublication({...newPublication, content: e.target.value})}
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-pub-author">Auteur</Label>
                    <Input 
                      id="new-pub-author"
                      value={newPublication.author}
                      onChange={(e) => setNewPublication({...newPublication, author: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddPublicationForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddPublication}
                      disabled={!newPublication.title || !newPublication.content}
                    >
                      Publier
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.publications.map(pub => (
                <Card key={pub.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img 
                      src={pub.image || "/placeholder.svg"} 
                      alt={pub.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{pub.title}</CardTitle>
                      <div className="flex">
                        {isEditing && activePublicationId === pub.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={saveEdits}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdits}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEditingPublication(pub.id)}
                              disabled={isEditing}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deletePublication(pub.id)}
                              disabled={isEditing}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription>{pub.publishDate} - Par {pub.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing && activePublicationId === pub.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="edit-pub-title">Titre</Label>
                          <Input 
                            id="edit-pub-title"
                            value={editedPublication.title} 
                            onChange={(e) => setEditedPublication({...editedPublication, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-pub-excerpt">Extrait</Label>
                          <Input 
                            id="edit-pub-excerpt"
                            value={editedPublication.excerpt} 
                            onChange={(e) => setEditedPublication({...editedPublication, excerpt: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-pub-content">Contenu</Label>
                          <Textarea 
                            id="edit-pub-content"
                            value={editedPublication.content} 
                            onChange={(e) => setEditedPublication({...editedPublication, content: e.target.value})}
                            rows={5}
                          />
                        </div>
                        <div>
                          <Label className="mb-2">Image</Label>
                          <ImageUploader
                            initialImage={pub.image || ""}
                            onImageUpload={handleImageUpload}
                            label="Image de publication"
                            maxSizeMB={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-2">{pub.excerpt}</p>
                        <p className="text-sm truncate line-clamp-2">{pub.content}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
