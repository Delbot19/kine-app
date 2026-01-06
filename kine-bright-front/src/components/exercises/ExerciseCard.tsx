import React, { useState } from "react";
import { CheckCircle2, Clock, Target, RefreshCw, Zap, LucideIcon } from "lucide-react";
import ExerciseFeedbackDialog, { FeedbackData } from "./ExerciseFeedbackDialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Exercise } from "@/api/exercise.service";

interface ExerciseCardProps {
  exercise: Exercise;
  onToggleComplete: (id: string, currentStatus: boolean, feedback?: FeedbackData) => void;
  animationDelay?: number;
}

const ExerciseCard = ({ exercise, onToggleComplete, animationDelay = 0 }: ExerciseCardProps) => {
  const [showFeedback, setShowFeedback] = useState(false);

  // Added handleCheck and handleFeedbackConfirm functions
  const handleCheck = () => {
    if (!exercise.completed) {
      // If marking as done, show feedback
      setShowFeedback(true);
    } else {
      // If unchecking, just proceed
      onToggleComplete(exercise.id, exercise.completed);
    }
  };

  const handleFeedbackConfirm = (feedback: FeedbackData) => {
    setShowFeedback(false);
    onToggleComplete(exercise.id, exercise.completed, feedback);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile': return 'bg-green-100 text-green-700 border-green-200';
      case 'Modéré': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Difficile': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getIcon = (iconName?: string): LucideIcon => {
    switch (iconName) {
      case 'target': return Target;
      case 'refresh': return RefreshCw;
      case 'zap': return Zap;
      default: return Target;
    }
  };

  const Icon = getIcon(exercise.icon);

  return (
    <>
      <ExerciseFeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        onConfirm={handleFeedbackConfirm}
        onCancel={() => setShowFeedback(false)}
        exerciseTitle={exercise.title}
      />

      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-lg opacity-0 animate-fade-in h-full flex flex-col pointer-events-auto",
          exercise.completed
            ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/10"
            : "bg-card border-border hover:border-primary/50"
        )}
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
      >
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header avec icône et badge difficulté */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-2 rounded-lg bg-background shadow-sm border",
              exercise.completed ? "border-green-200" : "border-border"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                exercise.completed ? "text-green-600" : "text-primary"
              )} />
            </div>
            <Badge variant="outline" className={cn("font-medium border", getDifficultyColor(exercise.difficulty))}>
              {exercise.difficulty}
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            <h3 className={cn(
              "font-semibold text-lg leading-tight transition-colors",
              exercise.completed ? "text-green-900 dark:text-green-100" : "text-foreground"
            )}>
              {exercise.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>

            {exercise.instructions && (
              <p className="text-sm text-blue-600 mb-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <span className="font-semibold">Note du kiné:</span> {exercise.instructions}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{exercise.duration}</span>
              </div>
              {exercise.tip && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Conseil pro</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div
                onClick={handleCheck}
                className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-all duration-200",
                  exercise.completed
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-input group-hover:border-primary bg-background"
                )}
              >
                {exercise.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors",
                exercise.completed ? "text-green-700 dark:text-green-300" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {exercise.completed ? "Terminé" : "Marquer comme fait"}
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ExerciseCard;
