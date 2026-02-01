import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, Phone, ArrowLeft, Mail, HandHelping, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_BASE_URL = "http://localhost:8000/api";

// Types pour notre système de réservation
type SlotStatus = 'free' | 'occupied' | 'selected';

interface Kine {
  _id: string;
  userId: {
    nom: string;
    prenom: string;
    email: string;
  };
  specialite: string;
  numeroRPPS: string;
  presentation?: string;
  telephone?: string; // Add if available in model or derive
}

interface PlanTraitement {
  _id: string;
  statut: 'en cours' | 'terminé' | 'annulé';
  kineId: string;
}

interface RendezVous {
  _id: string;
  date: string; // ISO string
  duree: number;
  statut?: string;
}

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // State for Calendar Navigation
  // Initialize with today's date, but smart advance if weekend
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 6=Sat
    const hours = now.getHours();

    // If Sunday OR (Saturday AND >= 13h), jump to next week
    if (day === 0 || (day === 6 && hours >= 13)) {
      return startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
    }
    return startOfWeek(now, { weekStartsOn: 1 });
  });
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  // States for data
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [kines, setKines] = useState<Kine[]>([]);
  const [selectedKine, setSelectedKine] = useState<Kine | null>(null);
  const [kineLocked, setKineLocked] = useState(false); // True if forced by plan
  const [appointments, setAppointments] = useState<RendezVous[]>([]);

  // Génération des horaires (08:00 - 16:30)
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  // Helper: Generate days for current view
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 6; i++) { // Monday to Saturday
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Navigation handlers
  const handlePreviousWeek = () => {
    const newDate = subWeeks(currentWeekStart, 1);
    // Don't allow going back too far (e.g. before today) if needed, but for now allow navigation
    // if (isBefore(newDate, startOfWeek(new Date(), { weekStartsOn: 1 }))) return;
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };


  // 1. Initial Data Fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Handle Mongoose _id vs id discrepancy
        const userId = (user as { _id?: string })._id || user.id;

        // A. Fetch Patient ID
        const patientRes = await axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, config);
        const currentPatientId = patientRes.data.data._id;
        setPatientId(currentPatientId);

        // B. Fetch Plans for Patient
        let plans: PlanTraitement[] = [];
        try {
          const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${currentPatientId}`, config);
          plans = plansRes.data.data;
        } catch (error) {
          // Ignore 404 if no plans found, or handle specific error codes
          console.warn("No plans found or error fetching plans:", error);
        }
        const activePlan = plans.find(p => p.statut === 'en cours');

        // C. Fetch Kines
        const kinesRes = await axios.get(`${API_BASE_URL}/kines`, config);
        const allKines: Kine[] = kinesRes.data.data || [];
        setKines(allKines);

        // D. Smart Selection Logic
        if (activePlan) {
          // Handle populated kineId
          const activeKineId = typeof activePlan.kineId === 'object' ? (activePlan.kineId as any)._id : activePlan.kineId;
          const kineForPlan = allKines.find(k => k._id === activeKineId);


          // E. Check Existing Appointments (Restriction Logic)
          try {
            const rdvsRes = await axios.get(`${API_BASE_URL}/rdvs/patient/${currentPatientId}?onlyUpcoming=true`, config);
            if (rdvsRes.data.success && rdvsRes.data.data.length > 0) {
              // User already has an appointment, redirect to dashboard
              toast({
                variant: "destructive", // or default/info
                title: "Action non autorisée",
                description: "Vous avez déjà un rendez-vous à venir. Veuillez voir avec votre kiné pour en planifier d'autres."
              });
              navigate('/dashboard');
              return; // Stop execution
            }
          } catch (e) {
            console.warn("Could not check existing appointments", e);
            // Fallthrough, don't block if check fails? Or block?
            // Let's assume safely block if we can't be sure, OR allow if error (fail open/close?).
            // Here: fail open (allow booking) if check fails, to avoid blocking on API errors unrelated to logic.
          }

          if (kineForPlan) {
            setSelectedKine(kineForPlan);
            setKineLocked(true);
            toast({
              title: "Kiné assigné",
              description: `Votre plan de traitement en cours est avec Dr. ${kineForPlan.userId.nom}.`,
            });
          } else if (allKines.length > 0) {
            // Fallback si le kiné du plan n'est pas trouvé
            setSelectedKine(allKines[0]);
          }
        } else if (allKines.length > 0) {
          // Par défaut, on sélectionne le premier kiné si aucun plan actif
          // Cela permet d'afficher des disponibilités tout de suite
          setSelectedKine(allKines[0]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les données. Veuillez réessayer."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, toast]);

  // 2. Fetch Appointments when Kine or Week changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedKine) return;
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch appointments starting from the beginning of the week
        // Note: The API likely returns all future ones, but we should verify the API capabilities.
        // If API supports ?date=... it returns >= date. So if we pass currentWeekStart, we get this week + future.
        const dateStr = currentWeekStart.toISOString().split('T')[0];
        // Add timestamp to prevent 304 caching
        const rdvsRes = await axios.get(`${API_BASE_URL}/rdvs?kineId=${selectedKine._id}&date=${dateStr}&_t=${Date.now()}`, config);

        if (rdvsRes.data.success) {
          setAppointments(rdvsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments", error);
        setAppointments([]);
      }
    };

    fetchAppointments();

    // Auto-refresh every 30 seconds to keep slots up-to-date
    const intervalId = setInterval(fetchAppointments, 30000);
    return () => clearInterval(intervalId);
  }, [selectedKine, currentWeekStart]);


  // Helper to check slot status
  const getSlotStatus = (dayDate: Date, time: string): SlotStatus => {
    const now = new Date();

    // Construct full date for this slot
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(dayDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // 1. Check if slot is in the past
    if (isBefore(slotDateTime, now)) return 'occupied'; // Using 'occupied' style for past slots

    // 1b. Check Specific Hours (Saturday closing at 13:00)
    const dayIndex = dayDate.getDay(); // 0-6 (0=Sun, 6=Sat)
    if (dayIndex === 6) {
      // Saturday logic: Closed after 13:00 (last slot likely 12:30)
      // If time >= 13:00, block it.
      // Or if checking strictly slots: 12:30 is OK (ends at 13:00). 13:00 is not OK (ends at 13:30).
      if (hours >= 13) return 'occupied'; // Block 13:00 and later
    }

    // 2. Check if selected
    if (selectedSlot && isSameDay(selectedSlot.date, dayDate) && selectedSlot.time === time) {
      return 'selected';
    }

    if (!selectedKine) return 'occupied'; // Cannot book if no kine selected

    // 3. Check availability against real appointments
    const isOccupied = appointments.some(rdv => {
      if (rdv.statut === 'annulé') return false;

      const rdvDate = new Date(rdv.date);
      // Compare time (ignoring small ms diffs)
      return Math.abs(rdvDate.getTime() - slotDateTime.getTime()) < 60000;
    });

    if (isOccupied) return 'occupied';

    return 'free';
  };

  const handleSlotClick = (dayDate: Date, time: string) => {
    if (getSlotStatus(dayDate, time) === 'occupied') return;
    if (!selectedKine) {
      toast({ title: "Sélectionnez un praticien", description: "Veuillez d'abord choisir un kiné.", variant: "destructive" });
      return;
    }

    if (selectedSlot && isSameDay(selectedSlot.date, dayDate) && selectedSlot.time === time) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ date: dayDate, time });
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedKine || !patientId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      const [hours, minutes] = selectedSlot.time.split(':').map(Number);
      const fullDate = new Date(selectedSlot.date);
      fullDate.setHours(hours, minutes, 0, 0);

      const payload = {
        patientId,
        kineId: selectedKine._id,
        date: fullDate.toISOString(),
        duree: 30, // Default duration
        motif: "Consultation - Nouveau RDV",
        statut: "en attente"
      };

      await axios.post(`${API_BASE_URL}/rdvs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Rendez-vous confirmé",
        description: `Rendez-vous avec Dr. ${selectedKine.userId.nom} le ${format(fullDate, 'dd MMMM', { locale: fr })} à ${selectedSlot.time}`,
      });

      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      console.error(error);
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erreur lors de la réservation";
      toast({ variant: "destructive", title: "Erreur", description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !patientId) {
    return (
      <>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const weekRangeLabel = `${format(currentWeekStart, 'd', { locale: fr })}-${format(addDays(currentWeekStart, 4), 'd MMMM yyyy', { locale: fr })}`;

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Prendre un nouveau rendez-vous</h1>
              <p className="text-muted-foreground mt-2">
                Sélectionnez un créneau disponible
              </p>
            </div>

            {/* Doctor Selection */}
            {!kineLocked && kines.length > 1 && (
              <div className="w-full md:w-72">
                <Select
                  onValueChange={(val) => setSelectedKine(kines.find(k => k._id === val) || null)}
                  value={selectedKine?._id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un praticien" />
                  </SelectTrigger>
                  <SelectContent>
                    {kines.map(k => (
                      <SelectItem key={k._id} value={k._id}>
                        Dr. {k.userId.nom} {k.userId.prenom} ({k.specialite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {kineLocked && selectedKine && (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium border border-primary/20">
                Praticien assigné : Dr. {selectedKine.userId.nom} (Suivi en cours)
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Calendrier (2/3 largeur) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-card">
              <CardContent className="p-6">
                {/* Header Calendrier */}
                <div className="flex items-center justify-between mb-8 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Calendrier des disponibilités</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium text-sm capitalize">{weekRangeLabel}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-6 mb-8 text-sm justify-center bg-slate-50/50 p-2 rounded-full w-fit mx-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-[#0066FF]"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-[#004bbd]"></div>
                    <span>Sélectionné</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-slate-200"></div>
                    <span className="text-muted-foreground">Occupé/Passé</span>
                  </div>
                </div>

                {/* Grille des horaires */}
                <div className="overflow-x-auto">
                  <div className="min-w-[500px]">
                    {/* En-têtes Jours */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      <div className="text-center pt-8 text-sm font-medium text-muted-foreground">
                        Horaires
                      </div>
                      {weekDays.map((day) => (
                        <div key={day.toString()} className="text-center space-y-1">
                          <div className="text-sm font-medium text-muted-foreground capitalize">
                            {format(day, 'EEE', { locale: fr })}
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {format(day, 'd')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lignes Horaires */}
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-7 gap-2 mb-2">
                        <div className="flex items-center justify-center text-sm text-muted-foreground bg-slate-50 rounded-md">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {time}
                        </div>
                        {weekDays.map((day) => {
                          const status = getSlotStatus(day, time);
                          return (
                            <button
                              key={`${day.toISOString()}-${time}`}
                              onClick={() => handleSlotClick(day, time)}
                              disabled={status === 'occupied'}
                              className={`
                                h-10 rounded-md text-sm font-medium transition-all duration-200
                                flex items-center justify-center
                                ${status === 'free' ? 'bg-[#0066FF] text-white hover:bg-[#0052cc]' : ''}
                                ${status === 'selected' ? 'bg-[#003d99] text-white ring-2 ring-offset-2 ring-[#003d99]' : ''}
                                ${status === 'occupied' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                              `}
                            >
                              {status === 'free' && 'Libre'}
                              {status === 'selected' && <Check className="h-4 w-4" />}
                              {/* Empty if occupied to reduce clutter, or keep text if preferred */}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite : Récap + Aide (1/3 largeur) */}
          <div className="space-y-6">
            {/* Carte Récapitulatif */}
            <Card className="border-none shadow-card top-6">
              <CardHeader>
                <CardTitle className="text-lg">Rendez-vous sélectionné</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSlot && selectedKine ? (
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-2">
                    <div className="flex items-center space-x-2 text-primary font-semibold">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(selectedSlot.date, 'EEEE d MMMM', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-primary font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>{selectedSlot.time}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center text-muted-foreground text-sm">
                    {!selectedKine ? "Sélectionnez d'abord un kiné" : "Aucun créneau sélectionné"}
                  </div>
                )}

                {selectedKine && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Praticien :</span>
                      <span className="font-medium text-right">Dr. {selectedKine.userId.nom} {selectedKine.userId.prenom}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="font-medium">30 minutes</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type :</span>
                      <span className="font-medium">{selectedKine.specialite}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[#004bbd] hover:bg-[#003d99]"
                  size="lg"
                  disabled={!selectedSlot || loading}
                  onClick={handleConfirm}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Confirmer le rendez-vous
                </Button>
              </CardContent>
            </Card>

            {/* Carte Aide */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <HandHelping className="h-5 w-5 text-primary" />
                  <span>Besoin d'aide ?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pour toute question ou demande particulière, contactez-nous.
                </p>
                {selectedKine && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{selectedKine.userId.email}</span>
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-2">
                  Nous contacter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentsPage;