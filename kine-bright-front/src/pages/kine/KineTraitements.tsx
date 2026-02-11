import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
  Pencil,
  Trash2,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, differenceInWeeks, isSameDay, addDays, subDays, startOfDay } from 'date-fns';
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

interface Exercise {
  _id?: string; // ID within the plan array (optional depending on mongoose version but usually present as subdoc id)
  exerciseId: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    image?: string;
  };
  instructions?: string;
  duree?: number;
  assignedAt?: string;
}

interface Patient {
  id: string;
  name: string;
  pathology: string;
}

interface ExerciseLog {
  _id: string;
  date: string;
  exerciseId: {
    title: string;
    description: string;
    icon: string;
  };
  completed: boolean;
  douleur?: number;
  difficulte?: string;
  ressenti?: string;
  modifications?: string;
}

const iconMap = {
  heart: Heart,
  trending: TrendingUp,
  dumbbell: Dumbbell,
};

const KineTraitements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(searchParams.get('patientId') || '');

  // Data for selected patient
  const [activePlan, setActivePlan] = useState<any>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Dialog states
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isObjectiveProgressDialogOpen, setIsObjectiveProgressDialogOpen] = useState(false);
  const [isObjectiveContentDialogOpen, setIsObjectiveContentDialogOpen] = useState(false);
  const [isSessionEditDialogOpen, setIsSessionEditDialogOpen] = useState(false);

  // Forms
  // Forms
  const [newObjective, setNewObjective] = useState<{ title: string; description: string; icon: 'heart' | 'trending' | 'dumbbell' }>({
    title: '', description: '', icon: 'heart'
  });

  // Edit States
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [editingObjectiveProgress, setEditingObjectiveProgress] = useState<number>(0);
  const [editingObjectiveContent, setEditingObjectiveContent] = useState<{ title: string; description: string; icon: 'heart' | 'trending' | 'dumbbell' }>({
    title: '', description: '', icon: 'heart'
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionMotif, setEditingSessionMotif] = useState({ title: '', description: '' });

  const [isDurationEditDialogOpen, setIsDurationEditDialogOpen] = useState(false);
  const [editingDuration, setEditingDuration] = useState<number>(0);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);

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
          setPatients(mappedPatients);
          if (mappedPatients.length > 0 && !selectedPatientId) {
            setSelectedPatientId(mappedPatients[0].id);
          } else if (mappedPatients.length === 0) {
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

        // Fetch Exercise Logs
        const logsRes = await axios.get(`${API_BASE_URL}/exercises/patient/${selectedPatientId}/logs`, config);
        setExerciseLogs(logsRes.data.data);

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

  const openObjectiveProgressEdit = (index: number, obj: Objective) => {
    setEditingObjectiveIndex(index);
    setEditingObjectiveProgress(obj.progress);
    setIsObjectiveProgressDialogOpen(true);
  };

  const handleUpdateObjectiveProgress = async () => {
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
        obj.status = 'En cours';
      }

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        objectifs: updatedObjectives
      }, config);

      setObjectives(updatedObjectives);
      setIsObjectiveProgressDialogOpen(false);
      setEditingObjectiveIndex(null);

    } catch (error) {
      console.error("Error updating objective progress", error);
    }
  };

  const openObjectiveContentEdit = (index: number, obj: Objective) => {
    setEditingObjectiveIndex(index);
    setEditingObjectiveContent({
      title: obj.title,
      description: obj.description,
      icon: obj.icon
    });
    setIsObjectiveContentDialogOpen(true);
  };

  const handleUpdateObjectiveContent = async () => {
    if (!activePlan || editingObjectiveIndex === null) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const updatedObjectives = [...objectives];
      const obj = updatedObjectives[editingObjectiveIndex];

      obj.title = editingObjectiveContent.title;
      obj.description = editingObjectiveContent.description;
      obj.icon = editingObjectiveContent.icon;

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        objectifs: updatedObjectives
      }, config);

      setObjectives(updatedObjectives);
      setIsObjectiveContentDialogOpen(false);
      setEditingObjectiveIndex(null);

    } catch (error) {
      console.error("Error updating objective content", error);
    }
  };

  const handleDeleteObjective = async (index: number) => {
    if (!activePlan) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) return;

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const updatedObjectives = [...objectives];
      updatedObjectives.splice(index, 1);

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        objectifs: updatedObjectives
      }, config);

      setObjectives(updatedObjectives);

    } catch (error) {
      console.error("Error deleting objective", error);
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

  const handleDeleteExercise = async (index: number) => {
    if (!activePlan) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet exercice du plan ?")) return;

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const currentExercises = activePlan.exercises || [];
      const updatedExercises = currentExercises.filter((_: any, i: number) => i !== index);

      // Map back to API format (un-populate exerciseId)
      const apiExercises = updatedExercises.map((e: any) => ({
        exerciseId: e.exerciseId._id || e.exerciseId, // Handle populated or not
        instructions: e.instructions,
        duree: e.duree,
        assignedAt: e.assignedAt
      }));

      await axios.put(`${API_BASE_URL}/plans-traitement/${activePlan._id}`, {
        exercises: apiExercises
      }, config);

      setActivePlan({ ...activePlan, exercises: updatedExercises });

    } catch (error) {
      console.error("Error deleting exercise", error);
      alert("Erreur lors de la suppression de l'exercice.");
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
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => openObjectiveContentEdit(i, objective)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteObjective(i)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
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
                        <div
                          className="relative pt-1 cursor-pointer group/progress"
                          onClick={() => openObjectiveProgressEdit(i, objective)}
                        >
                          <Progress value={objective.progress} className="h-2 group-hover/progress:h-3 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/progress:opacity-100 text-[10px] text-white font-bold pointer-events-none">
                            Modifier
                          </div>
                        </div>
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

          {/* Prescribed Exercises Section (Moved here) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Exercices Prescrits</h2>
              </div>
              {(!activePlan || !activePlan.exercises || activePlan.exercises.length === 0) && (
                <Button onClick={() => navigate(`/kine/prescriptions?patientId=${selectedPatientId}`)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter des exercices
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePlan && activePlan.exercises && activePlan.exercises.length > 0 ? (
                activePlan.exercises.map((ex: any, i: number) => (
                  <Card key={i} className="relative group overflow-hidden">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-white/80 hover:bg-red-50 hover:text-red-600 shadow-sm"
                        onClick={() => handleDeleteExercise(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4 flex gap-4">
                      <div className="h-16 w-16 bg-slate-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                        {ex.exerciseId && ex.exerciseId.image ? (
                          <img src={ex.exerciseId.image} alt={ex.exerciseId.title} className="h-full w-full object-cover" />
                        ) : (
                          <Dumbbell className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" title={ex.exerciseId?.title}>
                          {ex.exerciseId?.title || "Exercice Inconnu"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ex.instructions || "Aucune consigne spécifique."}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-5">
                            {ex.duree || 7} jours
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {ex.exerciseId?.category || "Général"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg bg-slate-50/50">
                  <p className="text-muted-foreground mb-4">Aucun exercice prescrit dans ce plan.</p>
                  {activePlan ? (
                    <Button variant="outline" onClick={() => navigate(`/kine/prescriptions?patientId=${selectedPatientId}`)}>
                      Ajouter des exercices
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">Créez un plan de traitement pour commencer.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Exercise Follow-up Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Suivi des Exercices</h2>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Exercice</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium">Douleur (1-5)</th>
                        <th className="px-4 py-3 font-medium">Difficulté</th>
                        <th className="px-4 py-3 font-medium">Ressenti / Commentaires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-muted-foreground">
                      {/* Logic to show exercises scheduled for this day */}
                      {(() => {
                        // 1. Get logs for the selected date
                        const dayLogs = exerciseLogs.filter(log => isSameDay(new Date(log.date), selectedDate));

                        // 2. Get exercises from plan that should be active on this date
                        const scheduledExercises = activePlan?.exercises?.filter((ex: any) => {
                          const assignmentDate = ex.assignedAt ? new Date(ex.assignedAt) : new Date(activePlan.createdAt);
                          const expiryDate = addDays(startOfDay(assignmentDate), ex.duree || activePlan.duree || 7);
                          const checkDate = startOfDay(selectedDate);
                          return checkDate >= startOfDay(assignmentDate) && checkDate <= expiryDate;
                        }) || [];

                        // 3. Merge: Display all scheduled exercises. 
                        // If log exists, use log data. If not, show "Non fait".
                        // Also include logs that might exist but aren't in current plan (history)? No, stick to plan for clarity or union?
                        // Let's use Union of Scheduled + Logs (in case of extra logs)

                        // Map scheduled to a display format
                        const displayItems = scheduledExercises.map((ex: any) => {
                          const log = dayLogs.find(l => l.exerciseId.title === ex.exerciseId.title); // Matching by title/ID best effort if IDs populated differently
                          // Better to match by ID but ex.exerciseId is populated object in plan, log.exerciseId might be populated too or ref.
                          // Let's assume title match or ID match if available.
                          const logMatch = dayLogs.find(l => {
                            // log.exerciseId is populated object from our service
                            // ex.exerciseId is populated object from plan
                            return (l.exerciseId as any)._id === (ex.exerciseId as any)._id || (l.exerciseId as any).title === (ex.exerciseId as any).title;
                          });

                          return {
                            id: ex.exerciseId._id,
                            title: ex.exerciseId.title || "Exercice",
                            completed: !!logMatch?.completed,
                            douleur: logMatch?.douleur,
                            difficulte: logMatch?.difficulte,
                            ressenti: logMatch?.ressenti,
                            modifications: logMatch?.modifications,
                            isScheduled: true
                          };
                        });

                        // Add logs that are NOT in scheduled (e.g. old plan exercises or extra ones)
                        dayLogs.forEach(log => {
                          const updatedTitle = (log.exerciseId as any).title;
                          if (!displayItems.find((i: any) => i.title === updatedTitle)) {
                            displayItems.push({
                              id: log._id,
                              title: updatedTitle,
                              completed: log.completed,
                              douleur: log.douleur,
                              difficulte: log.difficulte,
                              ressenti: log.ressenti,
                              modifications: log.modifications,
                              isScheduled: false // Extra log
                            });
                          }
                        });


                        return displayItems.length > 0 ? (
                          displayItems.map((item: any, idx: number) => (
                            <tr key={item.id || idx} className="hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">
                                {item.title}
                                {!item.isScheduled && <Badge variant="outline" className="ml-2 text-[10px]">Hors plan</Badge>}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={item.completed ? 'default' : 'secondary'}>
                                  {item.completed ? 'Fait' : 'Non fait'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {item.douleur !== undefined ? (
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                      item.douleur === 1 ? "bg-green-100 text-green-700" :
                                        item.douleur === 2 ? "bg-yellow-100 text-yellow-700" :
                                          item.douleur === 3 ? "bg-orange-100 text-orange-700" :
                                            item.douleur === 4 ? "bg-red-100 text-red-700" : "bg-red-900 text-white"
                                    )}>
                                      {item.douleur}
                                    </span>
                                  </div>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3">
                                {item.difficulte ? (
                                  <Badge variant="outline" className={cn(
                                    item.difficulte === 'Facile' ? 'border-green-200 text-green-700 bg-green-50' :
                                      item.difficulte === 'Modéré' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                        item.difficulte === 'Difficile' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                          'border-red-200 text-red-700 bg-red-50'
                                  )}>
                                    {item.difficulte}
                                  </Badge>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm max-w-[300px]">
                                <div className="flex flex-col gap-1">
                                  {item.ressenti && (
                                    <span className="italic">"{item.ressenti}"</span>
                                  )}
                                  {item.modifications && (
                                    <span className="text-xs text-amber-600">Adaptation: {item.modifications}</span>
                                  )}
                                  {!item.ressenti && !item.modifications && '-'}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              Aucun exercice prévu ou réalisé pour cette date.
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
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

      {/* Edit Objective Progress Dialog */}
      <Dialog open={isObjectiveProgressDialogOpen} onOpenChange={setIsObjectiveProgressDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsObjectiveProgressDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateObjectiveProgress}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Objective Content Dialog */}
      <Dialog open={isObjectiveContentDialogOpen} onOpenChange={setIsObjectiveContentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={editingObjectiveContent.title}
                onChange={(e) => setEditingObjectiveContent({ ...editingObjectiveContent, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingObjectiveContent.description}
                onChange={(e) => setEditingObjectiveContent({ ...editingObjectiveContent, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icône</Label>
              <Select value={editingObjectiveContent.icon} onValueChange={(value: 'heart' | 'trending' | 'dumbbell') => setEditingObjectiveContent({ ...editingObjectiveContent, icon: value })}>
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
            <Button variant="outline" onClick={() => setIsObjectiveContentDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateObjectiveContent}>Mettre à jour</Button>
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
