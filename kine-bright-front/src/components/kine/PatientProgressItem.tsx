import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';

interface PatientProgressItemProps {
  initials: string;
  name: string;
  treatment: string;
  progress: number;
  nextAppointment: string;
}

const PatientProgressItem = ({
  initials,
  name,
  treatment,
  progress,
  nextAppointment
}: PatientProgressItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow cursor-pointer">
      <Avatar className="h-10 w-10 bg-gray-200">
        <AvatarFallback className="text-sm font-medium text-gray-600">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground truncate">{treatment}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Progression</span>
          <span className="text-xs font-medium text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 mt-1" />
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground">Prochain RDV</p>
        <p className="text-sm font-medium">{nextAppointment}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </div>
  );
};

export default PatientProgressItem;
