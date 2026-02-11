import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, BookOpen, Play, Search, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { RessourceEducative } from '@/api/resource.service';
import MarkdownEditor from '@/components/admin/markdown/MarkdownEditor';

const AdminResources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<RessourceEducative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("articles");
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<RessourceEducative | null>(null);

  const [formData, setFormData] = useState<Partial<RessourceEducative>>({
    titre: "",
    type: "article",
    misEnAvant: false,
    description: "",
    contenu: "",
    url: "",
    imageUrl: "",
    visibilite: "public",
    tags: []
  });

  // Helper for tags string management in form
  const [tagsInput, setTagsInput] = useState("");

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE_URL}/ressources-educatives`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({ title: "Erreur", description: "Impossible de charger les ressources", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenDialog = (resource?: RessourceEducative) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({ ...resource });
      setTagsInput(resource.tags?.join(", ") || "");
      setActiveTab(resource.type === 'article' ? 'articles' : 'videos');
    } else {
      setEditingResource(null);
      setTagsInput("");
      setFormData({
        titre: "",
        type: activeTab === 'videos' ? 'video' : 'article',
        misEnAvant: false,
        description: "",
        contenu: "",
        url: "",
        imageUrl: "",
        visibilite: "public",
        tags: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.titre) {
      toast({ title: "Erreur", description: "Le titre est obligatoire", variant: "destructive" });
      return;
    }

    // Process tags
    const processedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== "");
    const dataToSend = { ...formData, tags: processedTags };

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let res;
      if (editingResource) {
        res = await axios.put(`${API_BASE_URL}/ressources-educatives/${editingResource._id}`, dataToSend, config);
      } else {
        res = await axios.post(`${API_BASE_URL}/ressources-educatives`, dataToSend, config);
      }

      if (res.data.success) {
        toast({ title: "Succès", description: editingResource ? "Ressource modifiée" : "Ressource créée" });
        setIsDialogOpen(false);
        fetchResources();
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la ressource", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/ressources-educatives/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Supprimé", description: "Ressource supprimée avec succès" });
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer la ressource", variant: "destructive" });
    }
  };

  const toggleFeatured = async (resource: RessourceEducative) => {
    const updatedResources = resources.map(r => r._id === resource._id ? { ...r, misEnAvant: !r.misEnAvant } : r);
    setResources(updatedResources);

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_BASE_URL}/ressources-educatives/${resource._id}`, { misEnAvant: !resource.misEnAvant }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
      fetchResources();
    }
  };

  const filteredResources = resources.filter(r =>
    r.type === (activeTab === 'videos' ? 'video' : 'article') &&
    r.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des Ressources</h1>
        <p className="text-muted-foreground">Créez et gérez les articles et vidéos éducatifs pour vos patients.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" /> Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Play className="h-4 w-4" /> Vidéos
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'articles' ? "Nouvel Article" : "Nouvelle Vidéo"}
          </Button>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Mis en Avant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : filteredResources.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun article trouvé</TableCell></TableRow>
                ) : filteredResources.map(resource => (
                  <TableRow key={resource._id}>
                    <TableCell className="font-medium">{resource.titre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {resource.tags?.map((tag, i) => <Badge key={i} variant="outline">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleFeatured(resource)}>
                        <Star className={`h-4 w-4 ${resource.misEnAvant ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(resource)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(resource._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Lien</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : filteredResources.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucune vidéo trouvée</TableCell></TableRow>
                ) : filteredResources.map(resource => (
                  <TableRow key={resource._id}>
                    <TableCell className="font-medium">{resource.titre}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {resource.tags?.map((tag, i) => <Badge key={i} variant="outline">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{resource.url}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(resource)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(resource._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? `Modifier ${formData.type === 'video' ? 'la vidéo' : 'l\'article'}` : `Nouvelle Ressource`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!editingResource && (
              <div className="flex gap-4 mb-4">
                <Button
                  variant={formData.type === 'article' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'article' })}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Article
                </Button>
                <Button
                  variant={formData.type === 'video' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'video' })}
                >
                  <Play className="mr-2 h-4 w-4" /> Vidéo
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={formData.titre}
                onChange={e => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de la ressource"
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Tags (séparés par des virgules)</Label>
                <Input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="Rééducation, Dos, Étirements..."
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.misEnAvant}
                  onCheckedChange={c => setFormData({ ...formData, misEnAvant: c })}
                />
                <Label>Mettre en avant</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (Résumé)</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Court résumé visible sur la carte..."
                rows={2}
              />
            </div>

            {formData.type === 'article' && (
              <div className="space-y-2">
                <Label>Image de couverture (URL)</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {formData.type === 'video' ? (
              <div className="space-y-2">
                <Label>Lien YouTube *</Label>
                <Input
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Contenu de l'article (Markdown) *</Label>
                <MarkdownEditor
                  value={formData.contenu || ""}
                  onChange={v => setFormData({ ...formData, contenu: v })}
                />
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full">
              {editingResource ? "Enregistrer les modifications" : "Créer la ressource"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminResources;
