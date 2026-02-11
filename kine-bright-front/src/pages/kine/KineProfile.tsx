import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit,
  Loader2,
  Stethoscope,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { API_BASE_URL } from '@/config';

const KineProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [kine, setKine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    telephone: '',
    adresse: '',
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
        const userId = user.id || (user as any)._id;
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const kineRes = await axios.get(`${API_BASE_URL}/kines/by-user/${userId}`, config);
        const kineData = kineRes.data.data;
        setKine(kineData);

        setEditForm({
          telephone: kineData.telephone || '',
          adresse: kineData.adresse || '',
        });

      } catch (error) {
        console.error("Error fetching kine profile:", error);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kine) return;

    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.put(`${API_BASE_URL}/kines/${kine._id}`, editForm, config);

      if (res.data.success) {
        setKine(res.data.data);
        toast({ title: "Succès", description: "Votre profil a été mis à jour." });
        setIsEditDialogOpen(false);
      }
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
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !kine) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Personal Information Card */}
      <Card className="border-border shadow-card bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
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
                      placeholder="Ex: 06 12 34 56 78"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={editForm.adresse}
                      onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })}
                      placeholder="Ex: 123 Rue de la Santé, 75014 Paris"
                    />
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
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 font-medium text-foreground uppercase">
                {user.nom}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Prénom</p>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 font-medium text-foreground">
                {user.prenom}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Email</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 text-foreground">
                {user.email}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 text-foreground min-h-[46px] flex items-center">
                {kine.telephone || <span className="text-muted-foreground italic text-sm">Non renseigné</span>}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 text-foreground min-h-[46px] flex items-center">
                {kine.adresse || <span className="text-muted-foreground italic text-sm">Non renseigné</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information Card */}
      <Card className="border-border shadow-card bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Informations professionnelles</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Numéro d'ordre</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 font-medium text-foreground">
                {kine.numeroRPPS}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 font-medium text-foreground">
                {kine.specialite}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100/50 text-foreground">
                {kine.createdAt ? format(new Date(kine.createdAt), "d MMMM yyyy", { locale: fr }) : "Non renseigné"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="border-border shadow-card bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
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
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Changer le mot de passe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KineProfile;
