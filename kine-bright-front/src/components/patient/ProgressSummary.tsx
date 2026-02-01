import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressStat {
  value: string;
  label: string;
}

interface ProgressSummaryProps {
  stats: ProgressStat[];
  className?: string;
}

const ProgressSummary = ({ stats, className }: ProgressSummaryProps) => {
  return (
    <div className={cn("bg-card rounded-lg border border-border p-6 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Résumé des progrès</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSummary;
