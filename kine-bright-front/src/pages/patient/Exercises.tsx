

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import DailyProgress from "@/components/patient/exercises/DailyProgress";
import ExerciseCard from "@/components/patient/exercises/ExerciseCard";
import EncouragementBanner from "@/components/patient/exercises/EncouragementBanner";
import { exerciseService, Exercise } from "@/api/exercise.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

import { API_BASE_URL } from '@/config';

const PatientExercises = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalCount = exercises.length;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Get Patient ID
        const userId = user.id || (user as any)._id;
        const patientRes = await axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, config);

        if (!patientRes.data.success) {
          throw new Error("Patient profile not found");
        }

        const pid = patientRes.data.data._id;
        setPatientId(pid);

        // 2. Get Exercises
        const data = await exerciseService.getTodayExercises();
        setExercises(data);

      } catch (error) {
        console.error("Error loading exercises:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos exercices.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleToggleComplete = async (id: string, currentStatus: boolean, feedback?: any) => {
    if (!patientId) return;

    // Optimistic update
    const newStatus = !currentStatus;
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, completed: newStatus } : ex
      )
    );

    try {
      await exerciseService.toggleCompletion(id, newStatus, feedback);
      // Optional: success toast or silent success
    } catch (error) {
      // Revert on failure
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, completed: currentStatus } : ex
        )
      );
      toast({
        title: "Erreur",
        description: "Mise à jour échouée.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Chargement de votre programme...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes Exercices</h1>
            <p className="text-sm text-muted-foreground">Programme du jour</p>
          </div>
        </div>
        <Badge className="bg-primary text-primary-foreground px-3 py-1">
          {completedCount}/{totalCount} terminés
        </Badge>
      </div>

      {/* Progression du jour */}
      <div className="mb-8">
        <DailyProgress completedCount={completedCount} totalCount={totalCount} />
      </div>

      {/* Message d'encouragement */}
      {totalCount > 0 && completedCount < totalCount && (
        <div className="text-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Continuez vos efforts ! 💪
          </h2>
          <p className="text-muted-foreground">
            Chaque exercice vous rapproche de votre rétablissement complet.
          </p>
        </div>
      )}

      {/* Grille des exercices */}
      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onToggleComplete={handleToggleComplete}
              animationDelay={300 + index * 100}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/20 rounded-xl mb-8">
          <h3 className="text-lg font-medium text-muted-foreground">Aucun exercice prévu pour aujourd'hui.</h3>
          <p className="text-sm text-muted-foreground mt-2">Profitez de votre journée de repos !</p>
        </div>
      )}

      {/* Banner d'encouragement */}
      {totalCount > 0 && (
        <EncouragementBanner completedCount={completedCount} totalCount={totalCount} />
      )}
    </>
  );
};

export default PatientExercises;
