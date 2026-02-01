import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';

interface AppointmentItemProps {
  initials: string;
  name: string;
  treatment: string;
  time: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

const AppointmentItem = ({ initials, name, treatment, time, isCompleted, onComplete }: AppointmentItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <Avatar className="h-10 w-10 bg-gray-200">
        <AvatarFallback className="text-sm font-medium text-gray-600">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{treatment}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-md">
          {time}
        </span>
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <button
            onClick={onComplete}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors group"
            title="Marquer comme terminé"
          >
            <CheckCircle2 className="h-5 w-5 text-gray-300 group-hover:text-primary" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentItem;
