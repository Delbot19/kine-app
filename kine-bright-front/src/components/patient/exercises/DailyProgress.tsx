import { Trophy } from "lucide-react";
import ProgressBar from "@/components/patient/ProgressBar";

interface DailyProgressProps {
  completedCount: number;
  totalCount: number;
}

const DailyProgress = ({ completedCount, totalCount }: DailyProgressProps) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border-2 border-border p-6 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          <div>
            <h2 className="font-semibold text-foreground">Progression du jour</h2>
            <p className="text-sm text-muted-foreground">
              Vous avez terminé {completedCount} exercices sur {totalCount}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-primary">{percentage}%</span>
          <p className="text-sm text-muted-foreground">Complété</p>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar value={percentage} variant="blue" size="lg" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Début</span>
          <span>Objectif atteint !</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgress;
