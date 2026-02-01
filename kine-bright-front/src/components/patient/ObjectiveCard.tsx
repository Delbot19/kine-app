import { Heart, TrendingUp, Dumbbell, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/patient/ProgressBar";
import { cn } from "@/lib/utils";

interface ObjectiveCardProps {
  title: string;
  description: string;
  progress: number;
  status: "En cours" | "Terminé" | "À venir";
  icon: "heart" | "trending" | "dumbbell";
  variant?: "blue" | "green" | "orange";
  className?: string;
  animationDelay?: number;
}

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  trending: TrendingUp,
  dumbbell: Dumbbell,
};

const ObjectiveCard = ({
  title,
  description,
  progress,
  status,
  icon,
  variant = "blue",
  className,
  animationDelay = 0,
}: ObjectiveCardProps) => {
  const Icon = iconMap[icon];

  const getBadgeVariant = () => {
    switch (status) {
      case "En cours":
        return "default"; // Adapted to existing badge variants
      case "Terminé":
        return "secondary"; // Adapted
      default:
        return "outline"; // Adapted
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-5 shadow-sm transition-all duration-500",
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
          <Badge variant={getBadgeVariant()}>{status}</Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <ProgressBar value={progress} variant={variant} />
      </div>
    </div>
  );
};

export default ObjectiveCard;
