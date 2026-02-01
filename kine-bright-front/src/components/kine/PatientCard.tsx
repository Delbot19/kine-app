import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Mail, Calendar, Eye, Pencil, Trash2 } from 'lucide-react';

interface PatientCardProps {
  name: string;
  age?: number;
  pathology?: string;
  status: 'actif' | 'en_pause' | 'termine';
  phone?: string;
  email?: string;
  lastAppointment?: string;
  nextAppointment?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  actif: { label: 'Actif', variant: 'success' as const },
  en_pause: { label: 'En pause', variant: 'warning' as const },
  termine: { label: 'Terminé', variant: 'secondary' as const },
};

const PatientCard = ({
  name,
  age,
  pathology,
  status = 'actif',
  phone,
  email,
  lastAppointment,
  nextAppointment,
  onView,
  onEdit,
  onDelete,
}: PatientCardProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusInfo = statusConfig[status] || statusConfig['actif'];

  return (
    <Card className="p-6 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 bg-muted">
          <AvatarFallback className="text-sm font-medium text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {age ? `${age} ans` : 'Age inconnu'} • {pathology || 'Aucune pathologie renseignée'}
          </p>

          {/* Contact Info Row */}
          <div className="flex flex-wrap items-center gap-x-20 gap-y-2 text-sm text-muted-foreground mb-3">
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Dernier RDV: {lastAppointment || 'Aucun'}</span>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Calendar className="h-4 w-4" />
            <span>Prochain RDV: {nextAppointment || 'Aucun planifié'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="border-gray-300 text-black hover:bg-gray-100"
          >
            <Eye className="h-4 w-4 mr-1" />
            Voir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-gray-300 text-black hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;
