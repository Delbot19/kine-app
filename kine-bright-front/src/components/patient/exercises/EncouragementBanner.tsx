import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EncouragementBannerProps {
  completedCount: number;
  totalCount: number;
}

const EncouragementBanner = ({ completedCount, totalCount }: EncouragementBannerProps) => {
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-xl border-2 border-border p-8 text-center opacity-0 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: 'forwards' }}>
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">
        {allCompleted ? "Félicitations !" : "Excellent travail !"}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {allCompleted
          ? "Vous avez terminé tous vos exercices du jour. Bravo pour votre persévérance !"
          : "Votre régularité dans les exercices est la clé de votre rétablissement."
        }
      </p>

      <Button asChild className="bg-primary hover:bg-primary/90">
        <Link to="/profile">
          Voir mon profil
        </Link>
      </Button>
    </div>
  );
};

export default EncouragementBanner;
