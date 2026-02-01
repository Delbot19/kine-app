import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Stethoscope,
  Target,
  Calendar,
  Clock,
  Plus,
  Heart,
  TrendingUp,
  Dumbbell,
  CheckCircle2,
  Circle,
  Edit,
  Users,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, differenceInWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Objective {
  title: string;
  description: string;
  progress: number;
  status: 'En cours' | 'Terminé' | 'À venir';
  icon: 'heart' | 'trending' | 'dumbbell';
}

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  rawDate: Date;
}

interface Patient {
  id: string;
  name: string;
  pathology: string;
}

const iconMap = {
  heart: Heart,
  trending: TrendingUp,
  dumbbell: Dumbbell,
};

const KineTraitements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Data for selected patient
  const [activePlan, setActivePlan] = useState<any>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Dialog states
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isObjectiveEditDialogOpen, setIsObjectiveEditDialogOpen] = useState(false);
  const [isSessionEditDialogOpen, setIsSessionEditDialogOpen] = useState(false);

  // Forms
  const [newObjective, setNewObjective] = useState<{ title: string; description: string; icon: 'heart' | 'trending' | 'dumbbell' }>({
    title: '', description: '', icon: 'heart'
  });

  // Edit States
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [editingObjectiveProgress, setEditingObjectiveProgress] = useState<number>(0);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionMotif, setEditingSessionMotif] = useState({ title: '', description: '' });

  const [isDurationEditDialogOpen, setIsDurationEditDialogOpen] = useState(false);
  const [editingDuration, setEditingDuration] = useState<number>(0);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api';

  // 1. Fetch Patients on Load
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const kineRes = await axios.get(`${API_BASE_URL}/kines/me`, config);
        const kineId = kineRes.data.data._id;

        const patientsRes = await axios.get(`${API_BASE_URL}/rdvs/patients/${kineId}`, config);

        if (patientsRes.data.success) {
          const mappedPatients = patientsRes.data.data.map((p: any) => ({
            id: p._id,
            name: `${p.userId.prenom} ${p.userId.nom}`,
            pathology: p.pathologie || 'Pathologie non spécifiée'
          }));
          setPatients(mappedPatients);
          if (mappedPatients.length > 0) {
            setSelectedPatientId(mappedPatients[0].id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching patients", error);
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  // 2. Fetch Plan & Sessions when Patient changes
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!selectedPatientId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch Plan
        const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${selectedPatientId}`, config);
        const plan = plansRes.data.data.find((p: any) => p.statut === 'en cours');
        setActivePlan(plan || null);
        setObjectives(plan?.objectifs || []);

        // Fetch Sessions (RDVs)
        const rdvsRes = await axios.get(`${API_BASE_URL}/rdvs/patient/${selectedPatientId}`, config);
        const allRdvs = rdvsRes.data.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Map to Session Display
        const mappedSessions = allRdvs
          .filter((r: any) => r.statut !== 'annulé' && r.statut !== 'en attente')
          .map((r: any) => {
            const rdvDate = new Date(r.date);
            let status: Session['status'] = 'upcoming';
            if (r.statut === 'terminé') status = 'completed';
            else if (isPast(rdvDate)) status = 'completed';

            // Check if "next"
            const isNext = !isPast(rdvDate) && allRdvs.filter((x: any) => !isPast(new Date(x.date)) && x.statut === 'à venir')[0]?._id === r._id;
            if (isNext) status = 'current';

            // Title logic
            let title = "Séance de suivi";
            let desc = r.kineId?.specialite || "Kinésithérapie";
            if (typeof r.motif === 'string') title = r.motif;
            else if (r.motif && r.motif.titre) {
              title = r.motif.titre;
              desc = r.motif.description || desc;
            }

            return {
              id: r._id,
              title,
              description: desc,
              date: format(rdvDate, 'd MMM', { locale: fr }),
              status,
              rawDate: rdvDate
            };
          });
        setSessions(mappedSessions);

      } catch (error) {
        console.error("Error fetching patient details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatientId]);

  const handleAddObjective = async () => {
    if (!activePlan) {
      alert("Aucun plan de traitement actif pour ce patient. Veuillez en créer un (Fonctionnalité à venir).");
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const newObj = {
        ...newObjective,
        progress: 0,
        status: 'En cours',
        variant: 'blue'
      };

      const updatedObjectives = [...objectives, newObj];

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        objectifs: updatedObjectives
      }, config);

      setObjectives(updatedObjectives as any);
      setNewObjective({ title: '', description: '', icon: 'heart' });
      setIsObjectiveDialogOpen(false);
    } catch (error) {
      console.error("Error adding objective", error);
    }
  };

  const openObjectiveEdit = (index: number, obj: Objective) => {
    setEditingObjectiveIndex(index);
    setEditingObjectiveProgress(obj.progress);
    setIsObjectiveEditDialogOpen(true);
  };

  const handleUpdateObjective = async () => {
    if (!activePlan || editingObjectiveIndex === null) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const updatedObjectives = [...objectives];
      const obj = updatedObjectives[editingObjectiveIndex];

      obj.progress = editingObjectiveProgress;
      if (obj.progress === 100) {
        obj.status = 'Terminé';
      } else {
        obj.status = 'En cours'; // Or logic to revert if < 100? Assuming strictly progress based for now.
      }

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        objectifs: updatedObjectives
      }, config);

      setObjectives(updatedObjectives);
      setIsObjectiveEditDialogOpen(false);
      setEditingObjectiveIndex(null);

    } catch (error) {
      console.error("Error updating objective", error);
    }
  };

  const openSessionEdit = (session: Session) => {
    setEditingSessionId(session.id);
    setEditingSessionMotif({ title: session.title, description: session.description });
    setIsSessionEditDialogOpen(true);
  };

  const handleUpdateSession = async () => {
    if (!editingSessionId) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // We assume PUT /rdvs/:id updates the body fields provided
      await axios.put(`${API_BASE_URL}/rdvs/${editingSessionId}`, {
        motif: {
          titre: editingSessionMotif.title,
          description: editingSessionMotif.description
        }
      }, config);

      // Optimistic UI Update
      setSessions(prev => prev.map(s => {
        if (s.id === editingSessionId) {
          return { ...s, title: editingSessionMotif.title, description: editingSessionMotif.description };
        }
        return s;
      }));

      setIsSessionEditDialogOpen(false);
      setEditingSessionId(null);

    } catch (error) {
      console.error("Error updating session", error);
    }
  };

  const openDurationEdit = () => {
    if (activePlan) {
      setEditingDuration(activePlan.duree || 0);
      setIsDurationEditDialogOpen(true);
    }
  };

  const handleUpdateDuration = async () => {
    if (!activePlan) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        duree: editingDuration
      }, config);

      setActivePlan({ ...activePlan, duree: editingDuration });
      setIsDurationEditDialogOpen(false);

    } catch (error) {
      console.error("Error updating duration", error);
    }
  };

  const handleTerminatePlan = async () => {
    if (!activePlan) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        statut: 'terminé'
      }, config);

      // Update local state: Set plan to null or status to terminated (which hides it based on current logic)
      setActivePlan(null);
      alert("Traitement terminé et archivé. Le patient est libéré.");

      // Optimize: Refresh patient list to show updated status if needed, or just clear selection
      setSelectedPatientId('');

    } catch (error) {
      console.error("Error terminating plan", error);
      alert("Erreur lors de la clôture du traitement.");
    }
  };

  // Derived Stats
  const completedSessionsCount = sessions.filter(s => s.status === 'completed').length;
  const averageProgress = objectives.length > 0
    ? Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length)
    : 0;

  const startDate = activePlan ? format(new Date(activePlan.createdAt), 'd MMMM yyyy', { locale: fr }) : '-';
  const estimDuration = activePlan?.duree ? Math.ceil(activePlan.duree / 2) : 0; // Weeks

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des traitements</h1>
            <p className="text-muted-foreground">Créer et modifier les plans de traitement</p>
          </div>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-[350px] h-auto min-h-[40px] [&>span]:line-clamp-none [&>span]:whitespace-normal text-left py-2">
              <SelectValue placeholder="Sélectionner un patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div>
                    <div className="font-medium whitespace-normal">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.pathology}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedPatientId ? (
        <>
          {/* Treatment Info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Début: {startDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Durée estimée: {estimDuration ? `${estimDuration} semaines (${activePlan?.duree} séances)` : 'Non définie'}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                onClick={openDurationEdit}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {activePlan && (
              <Button
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => setIsTerminateDialogOpen(true)}
              >
                Terminer le traitement
              </Button>
            )}
          </div>

          <AlertDialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Terminer le plan de traitement ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le plan sera archivé et le patient sera libéré de votre file active, lui permettant de choisir un nouveau kiné.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    handleTerminatePlan();
                    setIsTerminateDialogOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmer la clôture
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Objectives Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Objectifs du traitement</h2>
              </div>
              <Button onClick={() => setIsObjectiveDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un objectif
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {objectives.length > 0 ? objectives.map((objective, i) => {
                const Icon = iconMap[objective.icon as keyof typeof iconMap] || Heart;
                return (
                  <Card key={i} className="relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openObjectiveEdit(i, objective)}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 pr-8">
                          <h3 className="font-semibold text-foreground">{objective.title}</h3>
                          <Badge variant={objective.status === 'Terminé' ? 'secondary' : 'default'} className="mt-1">{objective.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{objective.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-semibold text-primary">{objective.progress}%</span>
                        </div>
                        <Progress value={objective.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground border rounded bg-slate-50">
                  Aucun objectif défini.
                </div>
              )}
            </div>
          </div>

          {/* Session Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Frise chronologique des séances</h2>
              </div>
              {/* Removed "Add Session" button as requested */}
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-0">
                  {sessions.length > 0 ? sessions.map((session, index) => (
                    <div key={session.id} className="relative flex items-start gap-4">
                      {/* Timeline line */}
                      {index !== sessions.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-[17px] top-10 w-0.5 h-[calc(100%-16px)]",
                            session.status === 'completed' || session.status === 'current'
                              ? "bg-primary"
                              : "bg-border"
                          )}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          "relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0",
                          session.status === 'completed'
                            ? "bg-primary"
                            : session.status === 'current'
                              ? "bg-blue-100 border-2 border-primary text-primary" // Different style for next
                              : "bg-muted border-2 border-border"
                        )}
                      >
                        {session.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                        ) : session.status === 'current' ? (
                          <Clock className="h-5 w-5 text-primary" /> // Use Clock for next
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{session.title}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{session.description}</p>
                            {session.status === 'current' && (
                              <Badge variant="default" className="mt-2">Prochaine séance</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={session.status === 'completed' || session.status === 'current' ? 'default' : 'secondary'}
                            >
                              {session.date}
                            </Badge>
                            {/* Edit Session Motif Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openSessionEdit(session)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-muted-foreground">Aucune séance planifiée.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Résumé des progrès</h3>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{completedSessionsCount}/{activePlan?.duree || '-'}</div>
                  <div className="text-sm text-muted-foreground">Séances réalisées</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{averageProgress}%</div>
                  <div className="text-sm text-muted-foreground">Progression moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {activePlan?.duree ? Math.max(0, Math.ceil((activePlan.duree - completedSessionsCount) / 2)) : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">Semaines restantes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
          <div className="text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Veuillez sélectionner un patient pour voir son traitement.</p>
          </div>
        </div>
      )}

      {/* Add Objective Dialog */}
      <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="obj-title">Titre</Label>
              <Input
                id="obj-title"
                value={newObjective.title}
                onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                placeholder="Ex: Amélioration de la mobilité"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-desc">Description</Label>
              <Textarea
                id="obj-desc"
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                placeholder="Décrivez l'objectif..."
              />
            </div>
            <div className="space-y-2">
              <Label>Icône</Label>
              <Select value={newObjective.icon} onValueChange={(value: 'heart' | 'trending' | 'dumbbell') => setNewObjective({ ...newObjective, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heart">Douleur (Cœur)</SelectItem>
                  <SelectItem value="trending">Mobilité (Graphique)</SelectItem>
                  <SelectItem value="dumbbell">Renforcement (Haltère)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsObjectiveDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddObjective}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Objective Dialog */}
      <Dialog open={isObjectiveEditDialogOpen} onOpenChange={setIsObjectiveEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour la progression</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center text-2xl font-bold text-primary">
              {editingObjectiveProgress}%
            </div>
            <Slider
              value={[editingObjectiveProgress]}
              max={100}
              step={5}
              onValueChange={(val) => setEditingObjectiveProgress(val[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground text-center">
              À 100%, l'objectif sera marqué comme "Terminé".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsObjectiveEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateObjective}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Motif Dialog */}
      <Dialog open={isSessionEditDialogOpen} onOpenChange={setIsSessionEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le motif de la séance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-session-title">Titre</Label>
              <Input
                id="edit-session-title"
                value={editingSessionMotif.title}
                onChange={(e) => setEditingSessionMotif({ ...editingSessionMotif, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-desc">Description</Label>
              <Textarea
                id="edit-session-desc"
                value={editingSessionMotif.description}
                onChange={(e) => setEditingSessionMotif({ ...editingSessionMotif, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateSession}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Duration Dialog */}
      <Dialog open={isDurationEditDialogOpen} onOpenChange={setIsDurationEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la durée du traitement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Nombre total de séances estimées</Label>
              <Input
                id="edit-duration"
                type="number"
                min="0"
                value={editingDuration}
                onChange={(e) => setEditingDuration(parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">Une séance standard par semaine est utilisée pour le calcul en semaines.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDurationEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateDuration}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default KineTraitements;
