import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingAppointmentItemProps {
  id: string;
  patientName: string;
  initials: string;
  date: string; // ISO string
  telephone?: string;
  onConfirm: (id: string) => void;
}

const PendingAppointmentItem = ({
  id,
  patientName,
  initials,
  date,
  telephone,
  onConfirm
}: PendingAppointmentItemProps) => {
  const rdvDate = new Date(date);
  const formattedDate = format(rdvDate, "d MMMM", { locale: fr });
  const formattedTime = format(rdvDate, "HH:mm");

  return (
    <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-lg mb-3">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 bg-orange-200">
          <AvatarFallback className="text-sm font-medium text-orange-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{patientName}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate} à {formattedTime}
            </span>
            {telephone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {telephone}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        onClick={() => onConfirm(id)}
      >
        <Check className="h-4 w-4 mr-1" />
        Confirmer
      </Button>
    </div>
  );
};

export default PendingAppointmentItem;
