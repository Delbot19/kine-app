import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Plus, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { rendezvousService, RendezVous } from '@/api/rendezvous.service';
import { kineService, KineProfile } from '@/api/kine.service';
import { useToast } from '@/components/ui/use-toast';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
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

// Filtered time slots
// Break is 13:00 - 14:00.
// So 12:30 is VALID (ends at 13:00).
// 13:00 and 13:30 are REMOVED.
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

interface PatientOption {
  _id: string;
  userId: {
    nom: string;
    prenom: string;
    email: string;
  };
}

const KinePlanning = () => {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = now.getHours();

    // Smart Navigation: If Sunday OR (Saturday AND Hour >= 13), show Next Week
    if (day === 0 || (day === 6 && hours >= 13)) {
      return startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
    }
    return startOfWeek(now, { weekStartsOn: 1 });
  });

  const [kineProfile, setKineProfile] = useState<KineProfile | null>(null);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; dayIndex: number } | null>(null);

  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    title: 'Séance de suivi - Nouveau RDV',
    description: ''
  });

  // Action States
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<RendezVous | null>(null);
  const [rescheduleData, setRescheduleData] = useState<{ date: Date; time: string }>({ date: new Date(), time: '08:00' });

  // 1. Fetch Kine Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await kineService.getMe();
        setKineProfile(profile);
      } catch (error) {
        console.error("Failed to load profile", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil.",
          variant: 'destructive'
        });
      }
    };
    fetchProfile();
  }, []);

  // 2. Load Data when Profile ID is available
  useEffect(() => {
    if (kineProfile && kineProfile._id) {
      loadPatients(kineProfile._id);
      loadAppointments(kineProfile._id);
    }
  }, [kineProfile, currentWeekStart]);

  const loadPatients = async (id: string) => {
    try {
      const data = await rendezvousService.getPatientsByKine(id);
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des patients.",
        variant: "destructive"
      });
    }
  };

  const loadAppointments = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await rendezvousService.getByKineAndDate(id, currentWeekStart);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handlePreviousWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));

  // Calendar Constraints
  const isSlotDisabled = (time: string, dayIndex: number) => {
    const date = addDays(currentWeekStart, dayIndex);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Disable Sunday completely
    if (day === 0) return true;

    // Disable Saturday AFTER 12:30
    if (day === 6) {
      // Time is "HH:MM", string comparison works perfectly: "14:00" > "12:30"
      if (time > "12:30") return true;
    }

    return false;
  };

  const handleSlotClick = (time: string, dayIndex: number) => {
    if (isSlotDisabled(time, dayIndex)) return;

    const existingAppointment = getAppointmentForSlot(time, dayIndex);
    if (!existingAppointment) {
      setSelectedSlot({ time, dayIndex });
      setNewAppointment({
        patientId: '',
        title: 'Séance de suivi - Nouveau RDV',
        description: kineProfile?.specialite || '' // Auto-fill Speciality
      });
      setIsDialogOpen(true);
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedSlot || !newAppointment.patientId || !kineProfile) return;

    try {
      const date = addDays(currentWeekStart, selectedSlot.dayIndex);
      const [hours, minutes] = selectedSlot.time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);

      await rendezvousService.create({
        patientId: newAppointment.patientId,
        kineId: kineProfile._id,
        date: date.toISOString(),
        duree: 30,
        motif: {
          titre: newAppointment.title,
          description: newAppointment.description
        },
        statut: 'à venir'
      });

      toast({
        title: "Succès",
        description: "Rendez-vous créé et confirmé.",
      });

      setIsDialogOpen(false);
      loadAppointments(kineProfile._id);
    } catch (error: any) {
      console.error('Failed to create appointment', error);
      const errorMsg = error.response?.data?.message || error.message || "Impossible de créer le rendez-vous.";
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel || !kineProfile) return;
    try {
      await rendezvousService.cancel(appointmentToCancel);
      toast({ title: "Rendez-vous annulé" });
      loadAppointments(kineProfile._id);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'annuler le rendez-vous", variant: "destructive" });
    } finally {
      setAppointmentToCancel(null);
    }
  };

  const openReschedule = (apt: RendezVous) => {
    const d = parseISO(apt.date);
    setAppointmentToReschedule(apt);
    setRescheduleData({
      date: d,
      time: format(d, 'HH:mm')
    });
  };

  const confirmReschedule = async () => {
    if (!appointmentToReschedule || !kineProfile) return;
    try {
      // Reconstruct date with new time
      const newDate = new Date(rescheduleData.date);
      const [hours, minutes] = rescheduleData.time.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);

      await rendezvousService.update(appointmentToReschedule._id, {
        date: newDate.toISOString()
      });

      toast({ title: "Rendez-vous reprogrammé" });
      loadAppointments(kineProfile._id);
      setAppointmentToReschedule(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Impossible de reprogrammer.";
      toast({ title: "Erreur", description: errorMsg, variant: "destructive" });
    }
  };

  const getAppointmentForSlot = (time: string, dayIndex: number) => {
    const slotDate = addDays(currentWeekStart, dayIndex);
    const [hours, minutes] = time.split(':').map(Number);

    return appointments.find(apt => {
      const aptDate = parseISO(apt.date);
      const sameDay = isSameDay(aptDate, slotDate);
      const sameTime = aptDate.getHours() === hours && aptDate.getMinutes() === minutes;
      const active = apt.statut !== 'annulé';

      return sameDay && sameTime && active;
    });
  };

  const formatWeekRange = () => {
    const endOfWeek = addDays(currentWeekStart, 6);
    const startMonth = format(currentWeekStart, 'd MMM', { locale: fr });
    const endMonth = format(endOfWeek, 'd MMM yyyy', { locale: fr });
    return `${startMonth} - ${endMonth}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planning & Rendez-vous</h1>
          <p className="text-muted-foreground">Gérez vos rendez-vous et votre planning</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-4 py-2 bg-white border rounded-md text-sm font-medium">
          {formatWeekRange()}
        </div>
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Planning Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="w-16 p-3 text-center text-muted-foreground">
                    <div className="flex justify-center">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                  </th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="p-3 text-center min-w-[120px]">
                      <div className="text-sm font-medium text-foreground">
                        {format(day, 'EEE', { locale: fr })}.
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(day, 'd', { locale: fr })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b last:border-b-0">
                    <td className="p-3 text-center text-sm text-muted-foreground border-r">
                      {time}
                    </td>
                    {weekDays.map((_, dayIndex) => {
                      const appointment = getAppointmentForSlot(time, dayIndex);
                      const isPast = addDays(currentWeekStart, dayIndex) < new Date() && !isSameDay(addDays(currentWeekStart, dayIndex), new Date());
                      const disabled = isSlotDisabled(time, dayIndex);

                      return (
                        <td
                          key={dayIndex}
                          className={`p-1 border-r last:border-r-0 h-12 relative group ${disabled ? 'bg-gray-100' : ''}`}
                        >
                          {!disabled && (
                            <>
                              {appointment ? (
                                <ContextMenu>
                                  <ContextMenuTrigger className="h-full w-full">
                                    <div className={`
                                            absolute inset-1 border rounded-md p-1 flex flex-col justify-center text-xs overflow-hidden cursor-context-menu
                                            ${appointment.statut === 'terminé' ? 'bg-gray-100 border-gray-200 text-gray-500' :
                                        appointment.statut === 'à venir' ? 'bg-green-100 border-green-200 text-green-700' :
                                          appointment.statut === 'en attente' ? 'bg-red-100 border-red-200 text-red-700' :
                                            'bg-blue-100 border-blue-200 text-blue-700'}
                                          `}>
                                      <span className="font-semibold truncate w-full">
                                        {appointment.patientId?.userId?.prenom} {appointment.patientId?.userId?.nom}
                                      </span>
                                      <span className="opacity-75 truncate w-full">
                                        {typeof appointment.motif === 'string' ? appointment.motif : appointment.motif?.titre || 'Rendez-vous'}
                                      </span>
                                    </div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem onClick={() => openReschedule(appointment)}>
                                      Reprogrammer
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      className="text-red-600"
                                      onClick={() => setAppointmentToCancel(appointment._id)}
                                    >
                                      Annuler le Rendez-vous
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              ) : (
                                !isPast && (
                                  <button
                                    onClick={() => handleSlotClick(time, dayIndex)}
                                    className="w-full h-full flex items-center justify-center text-muted-foreground/30 hover:bg-gray-200 hover:text-muted-foreground transition-colors rounded"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )
                              )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date et heure</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {selectedSlot && (
                  <>
                    {format(addDays(currentWeekStart, selectedSlot.dayIndex), 'EEEE d MMMM yyyy', { locale: fr })} à {selectedSlot.time}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients && patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.userId?.prenom} {patient.userId?.nom}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Aucun patient trouvé</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Spécialité)</Label>
              <Input
                id="description"
                value={newAppointment.description}
                placeholder="Ex: Kinésithérapie du sport"
                onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAppointment} disabled={!newAppointment.patientId}>
              Ajouter le RDV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Cancel Confirmation */}
      <AlertDialog open={!!appointmentToCancel} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action annulera définitivement le rendez-vous. Le créneau sera libéré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!appointmentToReschedule} onOpenChange={(open) => !open && setAppointmentToReschedule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogrammer le Rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded text-sm mb-4">
              Patient: <span className="font-semibold">{appointmentToReschedule?.patientId?.userId?.prenom} {appointmentToReschedule?.patientId?.userId?.nom}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nouvelle Date</Label>
                {/* Using a simple date input for now, could be improved with Calendar component */}
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={rescheduleData.date ? format(rescheduleData.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nouvelle Heure</Label>
                <Select
                  value={rescheduleData.time}
                  onValueChange={(val) => setRescheduleData({ ...rescheduleData, time: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentToReschedule(null)}>Annuler</Button>
            <Button onClick={confirmReschedule}>Confirmer le changement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KinePlanning;
