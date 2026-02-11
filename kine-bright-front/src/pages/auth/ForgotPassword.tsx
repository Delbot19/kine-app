import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { KeyRound, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      const token = response.data.data.token;

      // FOR TESTING ONLY: Show the link directly
      const resetLink = `${window.location.origin}/reset-password?token=${token}`;
      console.log('Reset Link:', resetLink);

      toast({
        title: "Email envoyé (Simulation)",
        description: (
          <div className="mt-2 text-xs border p-2 rounded bg-slate-100 dark:bg-slate-800">
            <p className="mb-1">Pour tester, cliquez sur ce lien :</p>
            <a href={resetLink} className="text-blue-500 underline break-all">{resetLink}</a>
          </div>
        ),
        duration: 10000,
      });

      // Optional: redirect to login after a delay
      // setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
