import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';


const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  specialite: z.string().min(2, 'La spécialité est requise'),
  numeroRPPS: z.string().min(5, 'Le numéro RPPS est requis'),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  presentation: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const AddKine = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${API_BASE_URL}/admin/register-kine`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        // Construct link using current browser origin to avoid port mismatch issues
        const token = res.data.data.token;
        const origin = window.location.origin;
        const link = `${origin}/setup-account?token=${token}`;

        setInvitationLink(link);
        toast({
          title: "Invitation créée",
          description: "Le compte a été pré-créé. Envoyez le lien d'invitation au kiné.",
        });
      }
    } catch (error: any) {
      console.error("Error creating kine:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de créer le compte."
      });
    }
  };

  const copyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Lien copié !" });
    }
  };

  if (invitationLink) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Compte Kiné pré-créé avec succès !</CardTitle>
            <CardDescription className="text-green-700">
              Veuillez copier le lien ci-dessous et l'envoyer au praticien pour qu'il finalise son inscription et définisse son mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={invitationLink} readOnly className="bg-white" />
              <Button onClick={copyLink} variant="outline" className="shrink-0 gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copié" : "Copier"}
              </Button>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                Retour au Dashboard
              </Button>
              <Button onClick={() => setInvitationLink(null)} className="ml-2">
                Ajouter un autre Kiné
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Ajouter un Kinésithérapeute</h1>
        <p className="text-muted-foreground">Créez un profil pour un nouveau praticien.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" {...register('nom')} placeholder="Ex: Dupont" />
                {errors.nom && <p className="text-red-500 text-xs">{errors.nom.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" {...register('prenom')} placeholder="Ex: Jean" />
                {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input id="email" type="email" {...register('email')} placeholder="jean.dupont@physio.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialite">Spécialité</Label>
                <Input id="specialite" {...register('specialite')} placeholder="Ex: Kiné du sport" />
                {errors.specialite && <p className="text-red-500 text-xs">{errors.specialite.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroRPPS">Numéro RPPS</Label>
                <Input id="numeroRPPS" {...register('numeroRPPS')} placeholder="11 chiffres" />
                {errors.numeroRPPS && <p className="text-red-500 text-xs">{errors.numeroRPPS.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone (Optionnel)</Label>
                <Input id="telephone" {...register('telephone')} placeholder="06 12 34 56 78" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse (Optionnel)</Label>
                <Input id="adresse" {...register('adresse')} placeholder="123 Rue de la Santé" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation">Présentation (Optionnel)</Label>
              <Input id="presentation" {...register('presentation')} placeholder="Brève présentation..." />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1e3a5f] hover:bg-[#162c4b]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Générer l\'invitation'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddKine;
