import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PatientCard from '@/components/kine/PatientCard';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { API_BASE_URL } from '@/config';

type PatientStatus = 'actif' | 'en_pause' | 'termine';
type FilterType = 'all' | PatientStatus;

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  // Mapped fields
  name: string;
  age?: number;
  pathology?: string;
  status: PatientStatus;
  phone?: string;
  lastAppointment?: string;
  nextAppointment?: string;
}

const KinePatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<{ status: PatientStatus; pathology: string }>({
    status: 'actif',
    pathology: ''
  });

  // Reset form when opening dialog
  useEffect(() => {
    if (editingPatient) {
      setEditForm({
        status: editingPatient.status,
        pathology: editingPatient.pathology || ''
      });
    }
  }, [editingPatient]);

  const handleSaveEdit = async () => {
    if (!editingPatient || !user) return;
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`${API_BASE_URL}/patients/${editingPatient._id}`, {
        status: editForm.status, // Backend expects 'statut', mapping needed? 
        // WAIT: Backend model uses 'statut' but 'updatePatient' endpoint usually takes body matching schema.
        // My Schema has 'statut' and 'pathologie'.
        // Frontend 'editForm.status' -> Backend 'statut'
        statut: editForm.status,
        pathologie: editForm.pathology
      }, config);

      // Update local state
      setPatients(prev => prev.map(p =>
        p._id === editingPatient._id
          ? { ...p, status: editForm.status, pathology: editForm.pathology }
          : p
      ));

      toast({ title: "Succès", description: "Patient mis à jour avec succès." });
      setEditingPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le patient." });
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Get Kine ID from User ID first
        const userId = user.id || (user as any)._id;
        const kineRes = await axios.get(`${API_BASE_URL}/kines/by-user/${userId}`, config);
        const kineId = kineRes.data.data._id;

        // 2. Fetch Patients
        let rawPatients = [];
        try {
          const patientsRes = await axios.get(`${API_BASE_URL}/rdvs/patients/${kineId}`, config);
          rawPatients = patientsRes.data.data || [];
        } catch (err: any) {
          if (err.response && err.response.status === 404) {
            // No patients found is not an application error
            rawPatients = [];
          } else {
            throw err; // Re-throw other errors
          }
        }

        // 3. Map to UI Model
        const mappedPatients: Patient[] = rawPatients.map((p: any) => {
          const userData = p.userId || {};

          // Calculate age
          let age;
          if (p.dateNaissance) {
            const birth = new Date(p.dateNaissance);
            const today = new Date();
            age = today.getFullYear() - birth.getFullYear();
          }

          return {
            _id: p._id,
            firstName: userData.prenom || "",
            lastName: userData.nom || "",
            name: userData.nom ? `${userData.prenom} ${userData.nom}` : "Patient Inconnu",
            email: userData.email,
            phone: p.telephone,
            age: age,
            pathology: p.pathologie || "Non spécifié", // This might need to come from a treatment plan, using placeholder for now
            status: (p.statut as PatientStatus) || 'actif',
            lastAppointment: p.lastRdv ? format(new Date(p.lastRdv), 'dd/MM/yyyy', { locale: fr }) : undefined,
            nextAppointment: p.nextRdv ? format(new Date(p.nextRdv), 'dd/MM/yyyy', { locale: fr }) : undefined,
          };
        });

        setPatients(mappedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des patients.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(fetchPatients, 30000);
    return () => clearInterval(intervalId);
  }, [user, toast]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.pathology || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' || patient.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: patients.length,
    actif: patients.filter((p) => p.status === 'actif').length,
    en_pause: patients.filter((p) => p.status === 'en_pause').length,
    termine: patients.filter((p) => p.status === 'termine').length,
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Tous (${counts.all})` },
    { key: 'actif', label: `Actifs (${counts.actif})` },
    { key: 'en_pause', label: `En pause (${counts.en_pause})` },
    { key: 'termine', label: `Terminés (${counts.termine})` },
  ];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos patients et leurs informations
          </p>
        </div>

      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6 bg-white border-none shadow-card">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient (nom, prénom...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className={
                  activeFilter === filter.key && filter.key === 'all'
                    ? 'gap-2 whitespace-nowrap'
                    : 'whitespace-nowrap'
                }
              >
                {filter.key === 'all' && activeFilter === 'all' && (
                  <Filter className="h-4 w-4" />
                )}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Patient List */}
      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              name={patient.name}
              age={patient.age}
              pathology={patient.pathology}
              status={patient.status}
              phone={patient.phone}
              email={patient.email}
              lastAppointment={patient.lastAppointment}
              nextAppointment={patient.nextAppointment}

              onView={() => navigate(`/kine/traitements?patientId=${patient._id}`)}
              onEdit={() => setEditingPatient(patient)}
            />
          ))
        ) : (
          <Card className="p-8 bg-white text-center border-dashed">
            <p className="text-muted-foreground">Aucun patient trouvé</p>
          </Card>
        )}
      </div>
      {/* Edit Patient Dialog */}
      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogDescription>
              Mettez à jour le statut et la pathologie de {editingPatient?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: PatientStatus) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="en_pause">En pause</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pathology">Pathologie</Label>
              <Input
                id="pathology"
                value={editForm.pathology}
                onChange={(e) => setEditForm({ ...editForm, pathology: e.target.value })}
                placeholder="Ex: Lombalgie chronique"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPatient(null)}>Annuler</Button>
            <Button onClick={handleSaveEdit} disabled={!editingPatient}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KinePatients;
