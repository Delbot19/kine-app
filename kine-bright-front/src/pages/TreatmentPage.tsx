import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Stethoscope, Target } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ObjectiveCard from "@/components/ObjectiveCard";
import SessionTimeline, { TimelineSession } from "@/components/SessionTimeline";
import ProgressSummary from "@/components/ProgressSummary";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { format, differenceInWeeks, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";

const API_BASE_URL = 'http://localhost:8000/api';

const TreatmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<TimelineSession[]>([]);
  const [progressStats, setProgressStats] = useState<any[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Safe access to user Id
        const userId = (user as any)._id || user.id;

        // 1. Get Patient ID
        const patientRes = await axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, config);
        const patientId = patientRes.data.data._id;

        // 2. Get Active Plan
        const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${patientId}`, config);
        const activePlan = plansRes.data.data.find((p: any) => p.statut === 'en cours');

        // 3. Get Appointments for Timeline
        const rdvsRes = await axios.get(`${API_BASE_URL}/rdvs/patient/${patientId}`, config);
        const allRdvs = rdvsRes.data.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (activePlan) {
          // Try to populate kine details if missing
          if (typeof activePlan.kineId === 'string' && allRdvs.length > 0) {
            const rdvWithKine = allRdvs.find((r: any) => r.kineId && (r.kineId._id === activePlan.kineId || r.kineId === activePlan.kineId));
            if (rdvWithKine) {
              activePlan.kineDetails = rdvWithKine.kineId;
            }
          }
          setPlan(activePlan);

          // Generate Timeline Stats
          const completed = allRdvs.filter((r: any) => {
            const isCancelled = r.statut === 'annulé' || r.statut === 'en_attente';
            if (isCancelled) return false;

            return r.statut === 'terminé' || (r.statut === 'à venir' && isPast(new Date(r.date)));
          }).length;
          const totalEstimated = activePlan.duree || 20; // Default to 20 if missing
          const remainingSessions = Math.max(0, totalEstimated - completed);
          const remainingWeeks = Math.ceil(remainingSessions / 2); // Assuming 2 sessions/week
          const percent = Math.min(100, Math.round((completed / totalEstimated) * 100));

          setProgressStats([
            { value: `${completed}/${totalEstimated}`, label: "Séances réalisées" },
            { value: `${percent}%`, label: "Progression moyenne" },
            { value: `${remainingWeeks}`, label: "Semaines restantes" },
          ]);

          // Map Appointments to Timeline Sessions
          const timelineSessions: TimelineSession[] = allRdvs
            .filter((rdv: any) => {
              // 1. Filter by Status: Only Confirmed ('à venir') or Completed ('terminé')
              // Exclude 'en attente' (Pending) and 'annulé' (Cancelled)
              const validStatuses = ['à venir', 'terminé'];
              if (!validStatuses.includes(rdv.statut)) return false;

              // 2. Filter out appointments with empty motif
              if (!rdv.motif) return false;
              if (typeof rdv.motif === 'string' && rdv.motif.trim() === '') return false;

              return true;
            })
            .map((rdv: any) => {
              const rdvDate = new Date(rdv.date);
              let status: TimelineSession['status'] = 'upcoming';
              if (rdv.statut === 'terminé') status = 'completed';
              else if (isPast(rdvDate)) status = 'completed';

              // Check if it's the "next" immediate upcoming appointment
              const isNext = !isPast(rdvDate) && allRdvs.filter((r: any) => !isPast(new Date(r.date)))[0]?._id === rdv._id;
              if (isNext) status = 'current';

              // Handle Rich Motif
              let title = "Séance de suivi";
              let description = rdv.kineId?.specialite || "Consultation de kinésithérapie";

              if (typeof rdv.motif === 'string') {
                title = rdv.motif;
              } else if (typeof rdv.motif === 'object' && rdv.motif !== null) {
                title = rdv.motif.titre || title;
                description = rdv.motif.description || description;
              }

              return {
                id: rdv._id,
                title: title,
                description: description,
                date: format(rdvDate, 'd MMM', { locale: fr }),
                status: status
              };
            });
          setSessions(timelineSessions);
        }

      } catch (error) {
        console.error("Error fetching treatment data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Determine Kine Name safely
  const kineName = plan?.kineDetails?.userId ? `Dr. ${plan.kineDetails.userId.prenom} ${plan.kineDetails.userId.nom}` :
    (plan?.kineId?.userId ? `Dr. ${plan.kineId.userId.prenom} ${plan.kineId.userId.nom}` : "Votre Kinésithérapeute");

  const startDateFormatted = plan ? format(new Date(plan.createdAt), 'd MMMM yyyy', { locale: fr }) : '-';

  return (
    <Layout>
      <div className="space-y-2 animate-in fade-in duration-500">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:pl-2 transition-all"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-secondary/50">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan de traitement</h1>
            <p className="text-muted-foreground">
              Suivi de votre rééducation avec <span className="font-medium text-foreground">{kineName}</span>
            </p>
          </div>
        </div>

        {/* Treatment info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Début: {startDateFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Durée estimée: {plan?.duree ? `${Math.ceil(plan.duree / 2)} semaines` : 'Non définie'}</span>
          </div>
        </div>

        {/* Treatment objectives */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Objectifs du traitement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plan ? (
              plan.objectifs && plan.objectifs.length > 0 ? (
                plan.objectifs.map((objective: any, index: number) => (
                  <ObjectiveCard
                    key={index}
                    title={objective.title}
                    description={objective.description}
                    progress={objective.progress || 0}
                    status={objective.status || "À venir"}
                    icon={objective.icon || "trending"}
                    variant={objective.variant || "blue"}
                    animationDelay={index * 150}
                  />
                ))
              ) : (
                <ObjectiveCard
                  title="Pas d'objectifs définis"
                  description="Votre kinésithérapeute n'a pas encore défini d'objectifs pour ce traitement."
                  progress={0}
                  status="À venir"
                  icon="trending"
                  variant="blue"
                  className="col-span-1 md:col-span-2 lg:col-span-3 opacity-70"
                />
              )
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground bg-card border border-border rounded-lg">
                Aucun plan de traitement actif trouvé.
              </div>
            )}
          </div>
        </section>

        {/* Session timeline */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Frise chronologique des séances</h2>
          </div>

          {sessions.length > 0 ? (
            <SessionTimeline sessions={sessions} />
          ) : (
            <div className="text-center py-10 bg-card rounded-lg border border-border text-muted-foreground">
              Aucune séance planifiée pour le moment.
            </div>
          )}
        </section>

        {/* Progress summary */}
        {progressStats.length > 0 && (
          <section>
            <ProgressSummary stats={progressStats} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default TreatmentPage;
