import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppointmentCard from '@/components/patient/AppointmentCard';
import ProfileCard from '@/components/patient/ProfileCard';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Heart,
  Phone,
  MapPin,
  Plus,
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { API_BASE_URL } from '@/config';

interface Patient {
  _id: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  groupeSanguin?: string;
  kineId?: string; // Add kineId
}

interface Appointment {
  id: string;
  date: string;
  rawDate: Date;
  time: string;
  doctor: string;
  specialty: string;
  location: string;
  status: 'confirmé' | 'en_attente' | 'annulé' | 'à venir' | 'en attente' | 'terminé';
  kineId?: string;
}

/**
 * Dashboard principal pour les patients
 * Interface moderne avec gestion des états de chargement et d'erreur
 */
const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // États pour la gestion des données
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [doctor, setDoctor] = useState<{ name: string; email: string } | null>(null);

  // Fonction pour obtenir le titre selon le sexe
  const getUserTitle = () => {
    return user?.sexe === 'F' ? 'Mme' : 'Mr';
  };

  // Chargement des données réelles
  const loadData = async (isBackground = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isBackground) setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 1. Récupérer l'ID Patient lié à l'utilisateur connecté
      // Le user du contexte a un ID qui est l'ID du compte User, pas du profil Patient.
      const userId = user.id || (user as { _id?: string })._id;
      const patientRes = await axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, config);

      if (patientRes.data.success) {
        const patientData = patientRes.data.data;
        const patientId = patientData._id;
        setPatient(patientData);

        // 2. Récupérer les RDV de ce patient
        const rdvsRes = await axios.get(`${API_BASE_URL}/rdvs/patient/${patientId}?onlyUpcoming=true&_t=${Date.now()}`, config);

        if (rdvsRes.data.success) {
          const rdvs = rdvsRes.data.data;

          const mappedRdvs = rdvs.map((rdv: { _id: string; date: string; statut: string; kineId?: { _id: string; userId?: { prenom: string; nom: string }; specialite?: string } }) => {
            const rdvDate = new Date(rdv.date);
            return {
              id: rdv._id,
              date: format(rdvDate, 'yyyy-MM-dd'),
              rawDate: rdvDate,
              time: format(rdvDate, 'HH:mm'),
              doctor: rdv.kineId?.userId ? `Dr. ${rdv.kineId.userId.prenom} ${rdv.kineId.userId.nom}` : 'Non assigné',
              kineId: rdv.kineId?._id, // Add kineId for availability check
              specialty: rdv.kineId?.specialite || 'Kinésithérapie',
              location: 'Cabinet KinéCare',
              status: rdv.statut as 'confirmé' | 'en_attente' | 'annulé' | 'à venir' | 'en attente' | 'terminé'
            };
          });
          setAppointments(mappedRdvs);
        }

        // 3. Récupérer le Plan de Traitement pour afficher le Kiné (Source prioritaire)
        const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${patientId}`, config);

        if (plansRes.data.success && plansRes.data.data && plansRes.data.data.length > 0) {
          // STRICT: Seul un plan 'en_cours' définit le kiné assigné
          const activePlan = plansRes.data.data.find((p: any) => p.statut === 'en cours');

          if (activePlan && activePlan.kineId && activePlan.kineId.userId) {
            const kineUser = activePlan.kineId.userId;
            setDoctor({
              name: `Dr. ${kineUser.prenom} ${kineUser.nom}`,
              email: kineUser.email
            });
          }
        }
      }
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      if ((err as { response?: { status?: number } }).response?.status === 404) {
        setAppointments([]);
      } else {
        setError("Impossible de charger vos données.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => loadData(true), 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fonction pour mettre à jour le profil patient
  const handleUpdateProfile = async (data: { telephone: string; adresse: string; groupeSanguin: string }) => {
    if (!patient) return;

    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const updateRes = await axios.put(
        `${API_BASE_URL}/patients/${patient._id}`,
        data,
        config
      );

      if (updateRes.data.success) {
        // Mettre à jour le state local avec les nouvelles données
        setPatient({ ...patient, ...data });
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        });
      }
    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos informations.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.patch(`${API_BASE_URL}/rdvs/${id}/cancel`, {}, config);
      if (res.data.success) {
        toast({ title: "Rendez-vous annulé", description: "Le rendez-vous a été annulé avec succès." });
        loadData();
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast({ title: "Erreur", description: "Impossible d'annuler le rendez-vous.", variant: "destructive" });
    }
  };

  const handleModifyAppointment = async (id: string, newDate: Date) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API_BASE_URL}/rdvs/${id}`, { date: newDate.toISOString() }, config);
      if (res.data.success) {
        toast({ title: "Rendez-vous modifié", description: "L'horaire du rendez-vous a été mis à jour." });
        loadData();
      }
    } catch (error) {
      console.error("Erreur modification:", error);
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Impossible de modifier le rendez-vous.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Chargement de vos données...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Message d'erreur si nécessaire */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* En-tête de bienvenue */}
        <div className="text-center space-y-4 bg-gradient-hero text-white p-8 rounded-2xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold">
            Bonjour {getUserTitle()} {user?.prenom} {user?.nom} ! 👋
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Bienvenue sur votre espace patient KinéCare.
            Suivez vos rendez-vous, consultez vos exercices et gérez votre traitement en toute simplicité.
          </p>
        </div>



        {/* Actions rapides avec effet Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Nouveau RDV Button Logic */}

          {patient?.kineId ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-not-allowed">
                    <Card className="bg-slate-100 border-white/20 opacity-60">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                          <Plus className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-600">Nouveau RDV</h3>
                        <p className="text-sm text-slate-500">Prendre un nouveau rendez-vous</p>
                      </CardContent>
                    </Card>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vous avez déjà un kiné assigné. Veuillez le contacter directement.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : appointments.length === 0 ? (
            <Link to="/appointments">
              <Card className="cursor-pointer transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 hover:shadow-medical hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Nouveau RDV</h3>
                  <p className="text-sm text-muted-foreground">Prendre un nouveau rendez-vous</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="cursor-not-allowed bg-slate-100 border-white/20 opacity-80" title="Vous avez déjà un rendez-vous à venir.">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-600">Rendez-vous programmé</h3>
                <p className="text-sm text-slate-500">Gérez vos prochains RDV avec votre kiné.</p>
              </CardContent>
            </Card>
          )}

          <Link to="/treatment">
            <Card className="cursor-pointer transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 hover:shadow-medical hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Mon traitement</h3>
                <p className="text-sm text-muted-foreground">Suivre mes avancées</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/exercises">
            <Card className="cursor-pointer transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 hover:shadow-medical hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Mes exercices</h3>
                <p className="text-sm text-muted-foreground">Vidéos et programmes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="cursor-pointer transition-all duration-300 group bg-white/40 backdrop-blur-md border-white/20 hover:bg-white/60 hover:shadow-medical hover:-translate-y-1">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Mon profil</h3>
                <p className="text-sm text-muted-foreground">Gérer mes informations</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Rendez-vous */}
          <div className="space-y-6">
            <Card className="shadow-card border-none bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Mes prochains rendez-vous</span>
                  </div>
                  <Badge variant="secondary">{appointments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Vos rendez-vous à venir au centre KinéCare
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length > 0 ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          variant="hero"
                          onCancel={handleCancelAppointment}
                          onModify={handleModifyAppointment}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-muted-foreground">Aucun rendez-vous programmé</p>
                      <Link to="/appointments">
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Prendre un rendez-vous
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Profil patient */}
          <div className="space-y-6">
            {user && patient && <ProfileCard
              patient={{
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: patient.telephone,
                adresse: patient.adresse,
                dateNaissance: patient.dateNaissance,
                sexe: user.sexe,
                groupeSanguin: patient.groupeSanguin
              }}
              onUpdate={handleUpdateProfile}
            />}

            {/* Card contact kiné */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contacter votre kiné</span>
                </CardTitle>
                <CardDescription className="text-primary/80">
                  Besoin d'aide ou d'une question urgente ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{doctor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <span className="font-medium">Disponible :</span>
                        <span>Lun-Ven 8h-18h</span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${doctor.email}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </Button>
                    </a>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <p>Aucun kiné assigné pour le moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;