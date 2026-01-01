import React, { useState } from 'react';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: {
    id: string;
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    location: string;
    status: 'confirmé' | 'en_attente' | 'annulé' | 'à venir' | 'en attente' | 'terminé';
    rawDate?: Date;
  };
  variant?: 'default' | 'hero';
  onCancel?: (id: string) => void;
  onModify?: (id: string, newDate: Date) => void;
}

/**
 * Card pour afficher un rendez-vous
 * Composant réutilisable avec design moderne
 */
const AppointmentCard = ({ appointment, variant = 'default', onCancel, onModify }: AppointmentCardProps) => {
  const isHero = variant === 'hero';
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);

  // États pour la modification
  const initialDate = appointment.rawDate || new Date(appointment.date);
  const [modifyDate, setModifyDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [modifyTime, setModifyTime] = useState(format(initialDate, 'HH:mm'));
  const [modifyError, setModifyError] = useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmé':
      case 'à venir':
        return isHero ? 'default' : 'default';
      case 'en_attente':
      case 'en attente':
        return 'secondary';
      case 'annulé':
        return 'destructive';
      case 'terminé':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmé':
      case 'à venir':
        return 'Confirmé';
      case 'en_attente':
      case 'en attente':
        return 'En attente';
      case 'annulé':
        return 'Annulé';
      case 'terminé':
        return 'Terminé';
      default:
        return status;
    }
  };

  const handleCancelConfirm = () => {
    if (onCancel) {
      onCancel(appointment.id);
    }
    setShowCancelDialog(false);
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModifyError(null);

    // Validation des horaires (pas de pause entre 12h et 14h)
    const [hours, minutes] = modifyTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startBreak = 12 * 60; // 12h00
    const endBreak = 14 * 60; // 14h00

    if (totalMinutes >= startBreak && totalMinutes < endBreak) {
      setModifyError("Les rendez-vous ne sont pas disponibles pendant la pause (12h-14h).");
      return;
    }

    // Validation des créneaux de 30 minutes
    if (minutes % 30 !== 0) {
      setModifyError("Les rendez-vous doivent être fixés par créneaux de 30 minutes (ex: 09h00, 09h30).");
      return;
    }

    if (onModify) {
      // Reconstituer l'objet Date
      const newDateTime = new Date(`${modifyDate}T${modifyTime}`);
      onModify(appointment.id, newDateTime);
    }
    setShowModifyDialog(false);
  };

  // Règles métier
  // Annulation : uniquement si pas encore payé ('en attente')
  const canCancel = appointment.status === 'en attente' || appointment.status === 'en_attente';
  // Modification : possible si 'en attente' ou 'à venir' (payé)
  const canModify = canCancel || appointment.status === 'à venir' || appointment.status === 'confirmé';

  const showActions = (canCancel || canModify) && onCancel && onModify;

  return (
    <>
      <Card
        className={`
          relative overflow-hidden transition-all duration-300
          ${isHero
            ? 'bg-gradient-hero border-none shadow-medical text-white'
            : 'shadow-card hover:shadow-medical border-l-4 border-l-primary bg-white'
          }
        `}
      >
        {isHero && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl pointer-events-none" />
        )}

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`text-lg ${isHero ? 'text-white' : 'text-foreground'}`}>
                {appointment.doctor}
              </CardTitle>
              <CardDescription className={`font-medium ${isHero ? 'text-white/90' : 'text-primary'}`}>
                {appointment.specialty}
              </CardDescription>
            </div>
            <Badge
              variant={getStatusVariant(appointment.status)}
              className={isHero ? 'bg-white/20 text-white hover:bg-white/30 border-0' : ''}
            >
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative z-10">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 text-sm ${isHero ? 'text-white/80' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              <span>{new Date(appointment.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className={`flex items-center space-x-2 text-sm ${isHero ? 'text-white/80' : 'text-muted-foreground'}`}>
              <Clock className="h-4 w-4" />
              <span>{appointment.time}</span>
            </div>
          </div>

          <div className={`flex items-center space-x-2 text-sm ${isHero ? 'text-white/80' : 'text-muted-foreground'}`}>
            <MapPin className="h-4 w-4" />
            <span>{appointment.location}</span>
          </div>

          {showActions && (
            <div className="flex space-x-2 pt-3">
              {canModify && (
                <Button
                  variant={isHero ? "secondary" : "outline"}
                  size="sm"
                  className={`flex-1 ${isHero ? 'bg-white/20 text-white hover:bg-white/30 border-0' : ''}`}
                  onClick={() => setShowModifyDialog(true)}
                >
                  Modifier
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-1 ${isHero ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-destructive hover:text-destructive'}`}
                  onClick={() => setShowCancelDialog(true)}
                >
                  Annuler
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous avec {appointment.doctor} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive hover:bg-destructive/90">
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
            <DialogDescription>
              Choisissez un nouvel horaire pour votre rendez-vous avec {appointment.doctor}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleModifySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={modifyDate}
                  onChange={(e) => setModifyDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  step="1800"
                  value={modifyTime}
                  onChange={(e) => {
                    setModifyTime(e.target.value);
                    setModifyError(null);
                  }}
                  min="09:00"
                  max="19:00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Horaires : 09h00 - 12h00 et 14h00 - 19h00 (par 30 min)
                </p>
                {modifyError && (
                  <p className="text-sm text-destructive font-medium">{modifyError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModifyDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCard;