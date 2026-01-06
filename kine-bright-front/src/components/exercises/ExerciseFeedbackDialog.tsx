import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface ExerciseFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (feedback: FeedbackData) => void;
  onCancel: () => void;
  exerciseTitle: string;
}

export interface FeedbackData {
  douleur: number;
  difficulte: string;
  ressenti: string;
  modifications: string;
}

const ExerciseFeedbackDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  exerciseTitle,
}: ExerciseFeedbackDialogProps) => {
  const [step, setStep] = useState(1);
  const [douleur, setDouleur] = useState([0]); // Slider uses array
  const [difficulte, setDifficulte] = useState<string>('Modéré');
  const [ressenti, setRessenti] = useState('');
  const [modifications, setModifications] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    onConfirm({
      douleur: douleur[0],
      difficulte,
      ressenti,
      modifications,
    });
  };

  const getDifficultyColor = (val: string) => {
    switch (val) {
      case 'Facile': return 'bg-green-100 border-green-200 text-green-700';
      case 'Modéré': return 'bg-blue-100 border-blue-200 text-blue-700';
      case 'Difficile': return 'bg-orange-100 border-orange-200 text-orange-700';
      case 'Impossible': return 'bg-red-100 border-red-200 text-red-700';
      default: return 'bg-secondary';
    }
  };

  // Step 1: Pain & Difficulty
  // Step 2: Sensation (Short)
  // Step 3: Modifications (Long)

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onCancel(); onOpenChange(val); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Validation : {exerciseTitle}</DialogTitle>
          <DialogDescription>
            Quelques questions rapides pour valider votre séance.
            Étape {step}/3
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Pain Level */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Niveau de douleur (0-10)</Label>
                  <span className={cn(
                    "font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center",
                    douleur[0] === 0 ? "bg-green-100 text-green-700" :
                      douleur[0] < 4 ? "bg-yellow-100 text-yellow-700" :
                        douleur[0] < 7 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                  )}>
                    {douleur[0]}
                  </span>
                </div>
                <Slider
                  value={douleur}
                  onValueChange={setDouleur}
                  max={10}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Aucune</span>
                  <span>Extrême</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-base">Difficulté ressentie</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Facile', 'Modéré', 'Difficile', 'Impossible'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setDifficulte(opt)}
                      className={cn(
                        "cursor-pointer border rounded-lg p-2 text-center text-sm font-medium transition-all hover:scale-105",
                        difficulte === opt ? `ring-2 ring-primary ${getDifficultyColor(opt)}` : "bg-background hover:bg-muted"
                      )}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="ressenti">Une sensation dominante ?</Label>
                <p className="text-xs text-muted-foreground">Décrivez en 2-3 mots (ex: "Chaleur cuisse", "Tiraillement dos")</p>
                <Input
                  id="ressenti"
                  placeholder="Ex: Fatigue musculaire agréable..."
                  value={ressenti}
                  onChange={(e) => setRessenti(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="modifications">Adaptations nécessaires ?</Label>
                <p className="text-xs text-muted-foreground">Avez-vous dû modifier l'exercice ? (Laissez vide si non)</p>
                <Textarea
                  id="modifications"
                  placeholder="Ex: J'ai réduit l'amplitude car ça tirait trop..."
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
            {step === 1 ? 'Annuler' : 'Retour'}
          </Button>
          <Button onClick={handleNext}>
            {step === 3 ? 'Terminer' : 'Suivant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFeedbackDialog;
