import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, CheckCircle2, Activity, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/kine/StatCard';
import AppointmentItem from '@/components/kine/AppointmentItem';
import PendingAppointmentItem from '@/components/kine/PendingAppointmentItem';
import PatientProgressItem from '@/components/kine/PatientProgressItem';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

import { API_BASE_URL } from '@/config';

const KineDashboard = () => {
  const { user } = useAuth();
  const [kine, setKine] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = format(today, "EEEE d MMMM yyyy", { locale: fr });
  const currentTime = format(today, "HH:mm");

  useEffect(() => {
    const fetchData = async (isBackground = false) => {
      const userId = user?.id || (user as any)?._id;
      if (!userId) return;

      // Only show spinner on first load
      // if (!isBackground) setLoading(true); // Already initialized to true

      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Run cleanup (Non-blocking)
        try {
          await axios.post(`${API_BASE_URL}/rdvs/cleanup`, {}, config);
        } catch (e) {
          console.warn("Cleanup failed, continuing...", e);
        }

        // 2. Get Kine Profile
        const kineRes = await axios.get(`${API_BASE_URL}/kines/by-user/${userId}`, config);
        const kineData = kineRes.data.data;

        if (!kineData) {
          console.error("Kine profile not found");
          return;
        }

        setKine(kineData);

        // 2. Get Today's Appointments
        // Assuming API accepts date filter like '?date=YYYY-MM-DD' or logic handles it.
        // If not supported perfectly, we fetch upcoming and filter in JS.
        // Let's assume we can fetch active appointments for today.
        // Using existing generic endpoint, we might get all. Let's try basic query.
        const dateStr = today.toISOString().split('T')[0];
        const appsRes = await axios.get(`${API_BASE_URL}/rdvs?kineId=${kineData._id}&date=${dateStr}`, config);

        const allApps = appsRes.data.data || [];

        // Filter Pending (All future dates)
        const pending = allApps.filter((rdv: any) => rdv.statut === 'en attente');
        setPendingAppointments(pending);

        // Filter Today's Agenda
        let todaysApps = allApps.filter((rdv: any) => {
          const rdvDate = new Date(rdv.date);
          return rdvDate.toDateString() === today.toDateString() && rdv.statut !== 'en attente';
        });

        // Sort by time
        todaysApps.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointments(todaysApps);

        // 3. Get Active Plans (Patients en cours)
        const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/kine/${kineData._id}`, config);
        let plans = plansRes.data.data || [];
        // Filter active
        plans = plans.filter((p: any) => p.statut === 'en cours');
        setActivePlans(plans);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, (user as any)?._id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCompleteAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.patch(`${API_BASE_URL}/rdvs/${id}/complete`, {}, config);

      if (res.data.success) {
        // Update local state to reflect change
        setAppointments(prev => prev.map(app =>
          app._id === id ? { ...app, statut: 'terminé' } : app
        ));
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  const handleConfirmAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put(`${API_BASE_URL}/rdvs/${id}`, { statut: 'à venir' }, config);

      if (res.data.success) {
        // Remove from pending
        const confirmedApp = pendingAppointments.find(a => a._id === id);
        setPendingAppointments(prev => prev.filter(app => app._id !== id));

        // Add to Today's Agenda if it's for today
        if (confirmedApp) {
          const appDate = new Date(confirmedApp.date);
          if (appDate.toDateString() === today.toDateString()) {
            // Re-fetch or simplistic local update (Add + Sort)
            // For simplicity, let's just push and sort, ensuring status is updated locally
            const updatedApp = { ...confirmedApp, statut: 'à venir' };
            setAppointments(prev => [...prev, updatedApp].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          }
        }
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

  // Calculate Stats
  const finishedApps = appointments.filter(a => a.statut === 'terminé').length;
  // Unique patients today could be calculated but simple count is fine
  const patientsToday = appointments.length;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Kinésithérapeute</h1>
          <p className="text-muted-foreground mt-1 capitalize">
            Bonjour Dr. {user?.nom?.toUpperCase()} {user?.prenom} — {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-white px-4 py-2 rounded-full shadow-sm">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Rendez-vous aujourd'hui"
          value={patientsToday}
          subtitle="Séances programmées"
          icon={Users}
        />
        <StatCard
          title="Séances terminées"
          value={finishedApps}
          subtitle={`Sur ${patientsToday} prévues`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Patients actifs"
          value={activePlans.length}
          subtitle="En cours de traitement"
          icon={Activity}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Appointments Section */}
        {pendingAppointments.length > 0 && (
          <div className="lg:col-span-2">
            <Card className="p-6 bg-orange-50/50 border-orange-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-900">Demandes en attente ({pendingAppointments.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingAppointments.map((app) => {
                  const patientUser = app.patientId?.userId || {};
                  const name = patientUser.nom ? `${patientUser.prenom} ${patientUser.nom}` : "Patient Inconnu";
                  const initials = patientUser.prenom ? `${patientUser.prenom[0]}${patientUser.nom[0]}`.toUpperCase() : "??";
                  const telephone = app.patientId?.telephone || "Non renseigné";

                  return (
                    <PendingAppointmentItem
                      key={app._id}
                      id={app._id}
                      patientName={name}
                      initials={initials}
                      date={app.date}
                      telephone={telephone}
                      onConfirm={handleConfirmAppointment}
                    />
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Today's Planning */}
        <Card className="p-6 bg-white shadow-card border-none">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Planning d'aujourd'hui</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Vos rendez-vous du {format(today, "dd/MM/yyyy")}
          </p>
          <div className="space-y-3">
            {appointments.length > 0 ? appointments.map((appointment) => {
              // Extract Patient Info (Assuming populated)
              const patientUser = appointment.patientId?.userId || {};
              const name = patientUser.nom ? `${patientUser.prenom} ${patientUser.nom}` : "Patient Inconnu";
              const initials = patientUser.prenom ? `${patientUser.prenom[0]}${patientUser.nom[0]}`.toUpperCase() : "??";

              const dateObj = new Date(appointment.date);
              const time = !isNaN(dateObj.getTime()) ? format(dateObj, 'HH:mm') : '--:--';

              // Handle motif (string or object)
              let motifDisplay = "Consultation";
              if (appointment.motif) {
                if (typeof appointment.motif === 'string') {
                  motifDisplay = appointment.motif;
                } else if (typeof appointment.motif === 'object' && appointment.motif.titre) {
                  motifDisplay = appointment.motif.titre;
                }
              }

              return (
                <AppointmentItem
                  key={appointment._id}
                  initials={initials}
                  name={name}
                  treatment={motifDisplay}
                  time={time}
                  isCompleted={appointment.statut === 'terminé'}
                  onComplete={() => handleCompleteAppointment(appointment._id)}
                />
              );
            }) : (
              <p className="text-muted-foreground text-sm italic">Aucun rendez-vous aujourd'hui.</p>
            )}
          </div>
        </Card>

        {/* Active Patients */}
        <Card className="p-6 bg-white shadow-card border-none">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Traitements en cours</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Suivi de progression des patients
          </p>
          <div className="space-y-3">
            {activePlans.length > 0 ? activePlans.slice(0, 5).map((plan) => { // Limit to 5
              const patientUser = plan.patientId?.userId || {};
              const name = patientUser.nom ? `${patientUser.prenom} ${patientUser.nom}` : "Patient Inconnu";
              const initials = patientUser.prenom ? `${patientUser.prenom[0]}${patientUser.nom[0]}`.toUpperCase() : "??";

              // Calculate generic progress
              // If no objectives, maybe random based on created date or 0. Let's use 0 safe.
              let avgProgress = 0;
              if (plan.objectifs && plan.objectifs.length > 0) {
                avgProgress = plan.objectifs.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / plan.objectifs.length;
              }

              return (
                <PatientProgressItem
                  key={plan._id}
                  initials={initials}
                  name={name}
                  treatment={plan.suivi || "Suivi Kinésithérapie"}
                  progress={Math.round(avgProgress)}
                  nextAppointment={"Voir agenda"} // TODO: Fetch next RDV
                />
              );
            }) : (
              <p className="text-muted-foreground text-sm italic">Aucun traitement actif.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default KineDashboard;
