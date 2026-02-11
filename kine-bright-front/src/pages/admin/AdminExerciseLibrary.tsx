import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Pencil, Trash2, Clock, Dumbbell, Loader2, Target, RefreshCw, Zap, Circle, Activity, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

interface Exercise {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Facile' | 'Modéré' | 'Difficile';
  icon?: 'target' | 'refresh' | 'zap' | 'circle' | 'dumbbell' | 'activity';
  duration: string;
  bodyParts: string[]; // "zone"
  videoUrl?: string;
  imageUrl?: string;
  tip?: string;
}

const categories = ['Toutes', 'Mobilité', 'Renforcement', 'Équilibre', 'Cardio', 'Étirements'];
const difficulties: Array<'Facile' | 'Modéré' | 'Difficile'> = ['Facile', 'Modéré', 'Difficile'];

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'Renforcement': return 'dumbbell';
    case 'Mobilité': return 'refresh';
    case 'Étirements': return 'activity';
    case 'Cardio': return 'zap';
    case 'Équilibre': return 'circle';
    default: return 'circle';
  }
};

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'target': return Target;
    case 'refresh': return RefreshCw;
    case 'zap': return Zap;
    case 'circle': return Circle;
    case 'dumbbell': return Dumbbell;
    case 'activity': return Activity;
    default: return Dumbbell;
  }
};

const emptyExercise: Omit<Exercise, '_id'> = {
  title: '',
  description: '',
  category: 'Mobilité',
  difficulty: 'Facile',
  duration: '',
  bodyParts: [],
  videoUrl: '',
  imageUrl: '',
  tip: ''
};

const AdminExerciseLibrary = () => {

  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Toutes');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Exercise, '_id'>>(emptyExercise);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch Exercises
  const fetchExercises = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Backend might send "default" category if missing, or we handle it here
        setExercises(res.data.data.map((ex: any) => ({
          ...ex,
          category: ex.category || 'Mobilité' // Fallback for existing data without category
        })));
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({ title: "Erreur", description: "Impossible de charger les exercices.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'Toutes' || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyExercise);
    setDialogOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditingId(ex._id);
    setForm({
      title: ex.title,
      description: ex.description,
      category: ex.category,
      difficulty: ex.difficulty,
      duration: ex.duration,
      bodyParts: ex.bodyParts || [],
      videoUrl: ex.videoUrl || '',
      imageUrl: ex.imageUrl || '',
      tip: ex.tip || '',
      icon: ex.icon
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Derive icon from category automatically
      const payload = {
        ...form,
        icon: getIconForCategory(form.category)
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/exercises/${editingId}`, payload, { headers });
        toast({ title: "Succès", description: "Exercice mis à jour." });
      } else {
        await axios.post(`${API_BASE_URL}/exercises`, payload, { headers });
        toast({ title: "Succès", description: "Exercice créé." });
      }
      setDialogOpen(false);
      fetchExercises();
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'exercice.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      fetchExercises();
      toast({ title: "Supprimé", description: "L'exercice a été supprimé." });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer l'exercice.", variant: "destructive" });
    }
  };

  const diffColor = (d: string) => {
    if (d === 'Facile') return 'bg-green-100 text-green-700';
    if (d === 'Modéré') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const catColor = (c: string) => {
    if (c === 'Mobilité') return 'bg-blue-600 text-white';
    if (c === 'Renforcement') return 'bg-green-600 text-white';
    if (c === 'Équilibre') return 'bg-blue-500 text-white';
    if (c === 'Cardio') return 'bg-red-500 text-white';
    if (c === 'Étirements') return 'bg-orange-500 text-white';
    return 'bg-gray-600 text-white';
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bibliothèque d'Exercices</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les exercices disponibles pour les kinésithérapeutes</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvel Exercice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un exercice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="outline" className="px-4 py-2 text-sm">{exercises.length} exercices au total</Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm">{filtered.length} résultats</Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ex) => {
          const IconComponent = getIconComponent(ex.icon);
          return (
            <Card key={ex._id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(ex)} className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(ex._id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{ex.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ex.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColor(ex.category)}`}>{ex.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffColor(ex.difficulty)}`}>{ex.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ex.duration}</span>
                  <span>{(ex.bodyParts || []).join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Aucun exercice trouvé.</div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier l\'exercice' : 'Nouvel Exercice'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nom de l'exercice" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'exercice" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== 'Toutes').map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulté</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durée</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="ex: 10-15 min" />
              </div>
              <div>
                <Label>Zone corporelle (virgule)</Label>
                <Input value={(form.bodyParts || []).join(', ')} onChange={(e) => setForm({ ...form, bodyParts: e.target.value.split(',').map(s => s.trim()) })} placeholder="ex: Épaule, Cou" />
              </div>
            </div>
            {/* Keeping extra fields (Video/Image) available in form but hidden/optional or minimal if user strictly matches reference? 
                Reference didn't have them. I will keep them out or minimal to match Reference UI. 
                I will omit them to be "Identique".
            */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editingId ? 'Enregistrer' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExerciseLibrary;
