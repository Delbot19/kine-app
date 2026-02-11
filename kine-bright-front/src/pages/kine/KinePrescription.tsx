import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Plus, X, FileText, Dumbbell, UserCheck, CalendarDays, ChevronRight, Target, RefreshCw, Zap, Circle, Activity } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

import { useAuth } from '@/contexts/AuthContext';

interface Exercise {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Facile' | 'Modéré' | 'Difficile';
  icon?: 'target' | 'refresh' | 'zap' | 'circle' | 'dumbbell' | 'activity';
  duration: string;
  bodyParts: string[];
}

interface SelectedExercise extends Exercise {
  instructions: string;
}

interface Patient {
  _id: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
  };
}

const categories = ['Toutes les catégories', 'Mobilité', 'Renforcement', 'Équilibre', 'Cardio', 'Étirements'];

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

const KinePrescription = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Toutes les catégories');

  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(searchParams.get('patientId') || '');
  const [duration, setDuration] = useState('7');

  const [activePlan, setActivePlan] = useState<any>(null);

  const { toast } = useToast();

  // Fetch Patient's Active Plan when selected
  useEffect(() => {
    if (!selectedPatientId) {
      setActivePlan(null);
      return;
    }

    const fetchActivePlan = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${selectedPatientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const plans = res.data.data || res.data.plans || [];
          // Find the active plan ('en cours') - case insensitive safety
          const active = plans.find((p: any) => p.statut?.toLowerCase() === 'en cours');
          setActivePlan(active || null);
        }
      } catch (err) {
        console.error("Error fetching active plan", err);
      }
    };
    fetchActivePlan();
  }, [selectedPatientId]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      // User might be null initially
      if (!user) return;

      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Exercises
        const exRes = await axios.get(`${API_BASE_URL}/exercises`, { headers });
        if (exRes.data.success) {
          setExercises(Array.isArray(exRes.data.data) ? exRes.data.data : []);
        }

        // 2. Fetch Patients (Robust Method)
        const userId = user.id || (user as any)._id;

        try {
          // Get Kine Profile ID first
          const kineRes = await axios.get(`${API_BASE_URL}/kines/by-user/${userId}`, { headers });
          const kineId = kineRes.data.data._id;

          // Fetch Patients using appointment relation
          const patRes = await axios.get(`${API_BASE_URL}/rdvs/patients/${kineId}`, { headers });
          const rawPatients = Array.isArray(patRes.data.data) ? patRes.data.data : [];
          setPatients(rawPatients);

        } catch (err: any) {
          console.log("Error fetching kine/patients:", err);
          setPatients([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Debug Active Plan
  useEffect(() => {
    console.log("Active Plan Updated:", activePlan);
  }, [activePlan]);

  const filtered = exercises.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'Toutes les catégories' || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  const toggleSelect = (ex: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((s) => s._id === ex._id);
      if (exists) {
        return prev.filter((s) => s._id !== ex._id);
      } else {
        return [...prev, { ...ex, instructions: '' }];
      }
    });
  };

  const updateInstructions = (id: string, text: string) => {
    setSelectedExercises(prev => prev.map(ex =>
      ex._id === id ? { ...ex, instructions: text } : ex
    ));
  };

  const isSelected = (id: string) => selectedExercises.some((s) => s._id === id);

  const [showOverloadConfirm, setShowOverloadConfirm] = useState(false);

  const isExerciseActive = (exerciseId: string) => {
    if (!activePlan || !activePlan.exercises) return false;

    // Find exercise in plan
    const planEx = activePlan.exercises.find((e: any) =>
      (e.exerciseId?._id === exerciseId) || (e.exerciseId === exerciseId)
    );

    if (!planEx) return false;

    // Check expiration
    // Fallback to plan creation date if assignedAt is missing (backward compatibility)
    const assignedDate = new Date(planEx.assignedAt || activePlan.createdAt);
    const durationDays = planEx.duree || activePlan.duree || 7;

    const expirationDate = new Date(assignedDate);
    expirationDate.setDate(expirationDate.getDate() + durationDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If today is <= expirationDate, it is ACTIVE.
    return today.getTime() <= expirationDate.getTime();
  };

  const handleCreate = async () => {
    if (!selectedPatientId || selectedExercises.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionnez un patient et au moins un exercice.', variant: 'destructive' });
      return;
    }

    if (!duration) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une durée (3, 4 ou 5 jours).', variant: 'destructive' });
      return;
    }

    // Check for missing instructions
    const missingInstructions = selectedExercises.some(ex => !ex.instructions || ex.instructions.trim() === '');
    if (missingInstructions) {
      toast({ title: 'Erreur', description: 'Veuillez ajouter une consigne pour chaque exercice.', variant: 'destructive' });
      return;
    }

    // Check overload
    const activeCount = activePlan?.exercises?.filter((e: any) => isExerciseActive(e.exerciseId?._id || e.exerciseId)).length || 0;
    const newCount = selectedExercises.length;

    if (activeCount + newCount > 5) {
      setShowOverloadConfirm(true);
      return;
    }

    await confirmCreate();
  };

  const confirmCreate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        patientId: selectedPatientId,
        duree: parseInt(duration),
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex._id,
          instructions: ex.instructions
        })),
        suivi: "Prescription standard",
      };
      console.log("Creating Plan Payload:", payload);

      await axios.post(`${API_BASE_URL}/plans-traitement`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: 'Prescription créée', description: `${selectedExercises.length} exercice(s) prescrit(s).` });

      setSelectedExercises([]);
      setSelectedPatientId('');
      setDuration('3'); // Reset to default 3 days
      setActivePlan(null); // Clear active plan view
      setShowOverloadConfirm(false);

    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({ title: "Erreur", description: "Impossible de créer la prescription.", variant: "destructive" });
    }
  };

  const catColor = (c: string) => {
    if (c === 'Mobilité') return 'bg-blue-600 text-white';
    if (c === 'Renforcement') return 'bg-green-600 text-white';
    if (c === 'Équilibre') return 'bg-blue-500 text-white';
    if (c === 'Cardio') return 'bg-red-500 text-white';
    if (c === 'Étirements') return 'bg-orange-500 text-white';
    return 'bg-gray-600 text-white';
  };

  const diffColor = (d: string) => {
    if (d === 'Facile') return 'bg-green-100 text-green-700';
    if (d === 'Modéré') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prescription d'Exercices</h1>
        <p className="text-muted-foreground mt-1">Sélectionnez des exercices et ajoutez vos consignes pour le patient</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Library */}
        <div className="flex-1">
          <Card className="h-full border-gray-200/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Bibliothèque d'Exercices</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un exercice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filtered.map((ex) => {
                  const IconComponent = getIconComponent(ex.icon || getIconForCategory(ex.category));
                  return (
                    <Card
                      key={ex._id}
                      className={cn(
                        'cursor-pointer border border-gray-200 hover:shadow-md transition-shadow relative',
                        isSelected(ex._id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'
                      )}
                      onClick={() => toggleSelect(ex)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          {isSelected(ex._id) && <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5 shadow-sm">Sélectionné</Badge>}
                        </div>
                        <h3 className="font-semibold text-foreground text-lg mb-1">{ex.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ex.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColor(ex.category)}`}>{ex.category}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffColor(ex.difficulty)}`}>{ex.difficulty}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-gray-100/50">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ex.duration}</span>
                          <span className="flex items-center gap-1 text-xs"><Dumbbell className="h-3.5 w-3.5" /> {(ex.bodyParts || []).join(', ')}</span>
                        </div>
                        {/* Duplicate Warning - Only if Active */}
                        {isExerciseActive(ex._id) && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full shadow-sm">
                            Déjà prescrit
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">Aucun exercice trouvé</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription Panel */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="sticky top-6 border-gray-200/50 shadow-lg shadow-primary/5">
            <CardContent className="p-6 flex flex-col h-[calc(100vh-100px)] lg:h-auto lg:max-h-[calc(100vh-100px)]">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Nouvelle Prescription</h2>
                  <p className="text-xs text-muted-foreground">Configurez le plan de traitement</p>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" /> Patient
                  </label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un patient" /></SelectTrigger>
                    <SelectContent>
                      {(patients || []).map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.userId?.nom} {p.userId?.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Durée (Séances)
                  </label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Jours</SelectItem>
                      <SelectItem value="4">4 Jours</SelectItem>
                      <SelectItem value="5">5 Jours</SelectItem>
                    </SelectContent>
                  </Select>

                  {activePlan && (
                    <div className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-1">
                      Plan actif trouvé ({activePlan.exercises?.length} exercices).
                      <br />
                      Créé le : {new Date(activePlan.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center justify-between">
                    <span>Exercices ({selectedExercises.length})</span>
                    {selectedExercises.length > 0 && (
                      <button onClick={() => setSelectedExercises([])} className="text-xs text-red-500 hover:underline">Tout effacer</button>
                    )}
                  </label>

                  {/* Overload Warning */}
                  {(() => {
                    const activeCount = activePlan?.exercises?.length || 0;
                    const newCount = selectedExercises.length;
                    const total = activeCount + newCount;

                    if (total > 5) {
                      return (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                          <div className="p-1 bg-red-100 rounded-full mt-0.5">
                            <Activity className="h-3 w-3 text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-700">Attention : Risque de surcharge</p>
                            <p className="text-[10px] text-red-600 leading-tight mt-0.5">
                              Ce patient a déjà {activeCount} exercice(s). Avec cette sélection, le total sera de {total} exercices.
                              Il est recommandé de ne pas dépasser 5 exercices.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {selectedExercises.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                      <Dumbbell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sélectionnez des exercices dans la bibliothèque</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedExercises.map((ex, idx) => (
                        <div key={ex._id} className="bg-gray-50/80 border border-gray-100 rounded-lg p-3 group hover:border-primary/20 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium line-clamp-1 flex gap-2 items-center">
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] w-5 justify-center bg-white border border-gray-200">{idx + 1}</Badge>
                              {ex.title}
                            </span>
                            <button onClick={() => toggleSelect(ex)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Instructions Select */}
                          <div className="relative">
                            <Select
                              value={ex.instructions}
                              onValueChange={(val) => updateInstructions(ex._id, val)}
                            >
                              <SelectTrigger className="w-full text-xs h-8">
                                <SelectValue placeholder="Choisir une consigne..." />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Faire le matin au réveil",
                                  "À faire après le déjeuner",
                                  "À faire le soir au coucher",
                                  "À faire avant chaque séance de sport",
                                  "À répéter 3 fois par jour"
                                ].map((opt) => (
                                  <SelectItem key={opt} value={opt} className="text-xs">
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Button className="w-full gap-2 shadow-lg shadow-primary/20" onClick={handleCreate} disabled={!selectedPatientId || selectedExercises.length === 0}>
                  <Plus className="h-4 w-4" /> Créer la Prescription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showOverloadConfirm} onOpenChange={setShowOverloadConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Activity className="h-5 w-5" /> Attention : Risque de surcharge
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Le patient a déjà des exercices en cours. Ajouter cette sélection portera le total au-delà de 5 exercices.
              <br /><br />
              Une surcharge d'exercices peut réduire l'adhérence du patient au traitement.
              <br /><br />
              <strong>Êtes-vous sûr de vouloir continuer ?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate} className="bg-red-600 hover:bg-red-700 text-white">
              Confirmer l'ajout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KinePrescription;
