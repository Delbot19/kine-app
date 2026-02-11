import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { LockKeyhole, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    if (!token) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Token de réinitialisation manquant.",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        motDePasse: password
      });

      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé.",
      });

      navigate('/login');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la réinitialisation.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">Lien invalide ou expiré.</p>
            <Button variant="outline" onClick={() => navigate('/login')}>Retour à la connexion</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Réinitialisation</CardTitle>
          <CardDescription>
            Choisissez un nouveau mot de passe sécurisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
