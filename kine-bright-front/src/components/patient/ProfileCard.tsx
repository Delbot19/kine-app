import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileCardProps {
  patient: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
    dateNaissance?: string;
    sexe?: 'H' | 'F';
    groupeSanguin?: string;
  };
  onUpdate?: (data: { telephone: string; adresse: string; groupeSanguin: string }) => void;
}

/**
 * Card pour afficher les informations du patient
 * Design moderne avec avatar et informations organisées
 */
const ProfileCard = ({ patient, onUpdate }: ProfileCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    telephone: patient.telephone || '',
    adresse: patient.adresse || '',
    groupeSanguin: patient.groupeSanguin || ''
  });

  const getInitials = () => {
    return `${patient.prenom?.charAt(0) || ''}${patient.nom?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    }
    setIsOpen(false);
  };

  return (
    <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-20 h-20 bg-gradient-primary text-primary-foreground text-xl font-bold">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-foreground">
              {patient.prenom} {patient.nom}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Patient PhysioCenter
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations personnelles */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Email :</span>
            <span className="text-foreground font-medium">{patient.email}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Téléphone :</span>
            <span className="text-foreground font-medium">
              {patient.telephone || 'Non renseigné'}
            </span>
          </div>

          <div className="flex items-start space-x-3 text-sm">
            <MapPin className="h-4 w-4 text-primary mt-0.5" />
            <span className="text-muted-foreground">Adresse :</span>
            <span className="text-foreground font-medium">
              {patient.adresse || 'Non renseignée'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Date de naissance :</span>
            <span className="text-foreground font-medium">
              {formatDate(patient.dateNaissance)}
              {getAge(patient.dateNaissance) && (
                <span className="text-muted-foreground ml-2">
                  ({getAge(patient.dateNaissance)} ans)
                </span>
              )}
            </span>
          </div>

          {patient.groupeSanguin && (
            <div className="flex items-center space-x-3 text-sm">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Groupe sanguin :</span>
              <span className="text-foreground font-medium">{patient.groupeSanguin}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-border">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Modifier mes informations
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Modifier mes informations</DialogTitle>
                <DialogDescription>
                  Mettez à jour vos informations personnelles
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      placeholder="123 Rue de la Santé, 75000 Paris"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="groupeSanguin">Groupe sanguin</Label>
                    <Select
                      value={formData.groupeSanguin}
                      onValueChange={(value) => setFormData({ ...formData, groupeSanguin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;