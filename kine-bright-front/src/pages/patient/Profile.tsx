import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit,
  CalendarCheck,
  Dumbbell,
  Heart,
  Loader2,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { patientService, Patient } from "@/api/patient.service";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";

import { API_BASE_URL } from '@/config';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [practitioner, setPractitioner] = useState<{ name: string; email: string; phone?: string; role: string } | null>(null);

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    telephone: '',
    adresse: '',
    groupeSanguin: '',
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch Patient Details
        // We handle user._id (from DB) vs user.id (frontend interface)
        const userId = user.id || (user as any)._id;
        const patientData = await patientService.getByUserId(userId);
        setPatient(patientData);
        setEditForm({
          telephone: patientData.telephone || '',
          adresse: patientData.adresse || '',
          groupeSanguin: patientData.groupeSanguin || '',
        });

        // 2. Fetch Active Plan for Practitioner Info
        const token = localStorage.getItem('authToken');
        const plansRes = await axios.get(`${API_BASE_URL}/plans-traitement/patient/${patientData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (plansRes.data.success && plansRes.data.data && plansRes.data.data.length > 0) {
          // STRICT: Seul un plan 'en_cours' définit le kiné assigné
          const activePlan = plansRes.data.data.find((p: any) => p.statut === 'en cours');

          if (activePlan && activePlan.kineId && activePlan.kineId.userId) {
            const kineUser = activePlan.kineId.userId;
            setPractitioner({
              name: `Dr. ${kineUser.prenom} ${kineUser.nom}`,
              email: kineUser.email,
              role: activePlan.kineId.specialite || "Kinésithérapeute"
            });
          }
        }

      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du profil."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const getAge = (dateString?: string) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      const updated = await patientService.update(patient._id, editForm);
      setPatient(updated);
      toast({ title: "Succès", description: "Votre profil a été mis à jour." });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Échec de la mise à jour." });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.patch(
        `${API_BASE_URL}/users/me/password`,
        { oldPassword: currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast({ title: "Succès", description: "Mot de passe modifié avec succès." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(error);
      const msg = (error as any).response?.data?.message || "Erreur lors du changement de mot de passe.";
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!user || !patient) return null;

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="border-border animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-foreground">{user.prenom} {user.nom}</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Patient</p>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">Compte Actif</Badge>
                      <Badge variant="outline">{getAge(patient.dateNaissance)} ans</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="border-border animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">Informations personnelles</CardTitle>
                      <p className="text-sm text-muted-foreground">Vos coordonnées et informations de contact</p>
                    </div>
                  </div>

                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier mes informations</DialogTitle>
                        <DialogDescription>Mettez à jour vos coordonnées.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            value={editForm.telephone}
                            onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Adresse</Label>
                          <Input
                            id="address"
                            value={editForm.adresse}
                            onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="blood">Groupe Sanguin</Label>
                          <Select
                            value={editForm.groupeSanguin}
                            onValueChange={(val) => setEditForm({ ...editForm, groupeSanguin: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium text-foreground">{user.prenom} {user.nom}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">{formatDate(patient.dateNaissance)} ({getAge(patient.dateNaissance)} ans)</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">{patient.telephone}</p>
                    </div>
                  </div>
                  {patient.groupeSanguin && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Groupe Sanguin</p>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-foreground">{patient.groupeSanguin}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{patient.adresse}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="border-border animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">Sécurité</CardTitle>
                    <p className="text-sm text-muted-foreground">Gérez votre mot de passe</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <PasswordInput
                      id="currentPassword"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <PasswordInput
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Changer le mot de passe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-border animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/appointments">
                    <CalendarCheck className="h-4 w-4" />
                    Prendre un RDV
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/exercises">
                    <Dumbbell className="h-4 w-4" />
                    Mes exercices
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" asChild>
                  <Link to="/treatment">
                    <Heart className="h-4 w-4" />
                    Plan de traitement
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Practitioner Info */}
            <Card className="border-border animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardHeader>
                <CardTitle className="text-lg">Informations du praticien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {practitioner ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-primary/10 text-primary">DR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{practitioner.name}</p>
                        <p className="text-sm text-muted-foreground">{practitioner.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">

                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{practitioner.email}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-green-500 hover:bg-green-600 gap-2" onClick={() => window.location.href = `mailto:${practitioner.email}`}>
                      <Mail className="h-4 w-4" />
                      Contacter
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center">Aucun praticien assigné.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
