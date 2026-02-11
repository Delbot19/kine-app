import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock } from 'lucide-react';
import { API_BASE_URL } from '@/config';


const SetupAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  // We don't use useAuth().login because the setup returns a token directly potentially, 
  // or we can auto-login via context if we expose a setSession method. 
  // For simplicity, let's treat the response, store token, and reload or redirect.
  // Actually, useAuth usually manages state. We might need to manually set local storage and reload app 
  // or add a method to context. `login` method expects credentials.
  // Let's just redirect to login with a success message for now, OR do the auto-login if possible.
  // The service returns `{ token, user }`. We can set localStorage and call window.location.reload() to trigger AuthProvider init.

  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({ variant: "destructive", title: "Erreur", description: "Lien invalide ou manquant." });
      navigate('/login');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Erreur", description: "Le mot de passe doit faire 8 caractères min." });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/setup-account`, {
        token,
        motDePasse: password
      });

      if (res.data.success) {
        // Auto Login logic
        localStorage.setItem('authToken', res.data.data.token);
        toast({
          title: "Compte configuré !",
          description: "Bienvenue sur votre espace.",
        });
        // Force reload to init auth context
        window.location.href = '/kine/dashboard';
      }
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Lien expiré ou invalide."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Lien invalide</CardTitle>
          <CardDescription className="text-red-600">Aucun token n'a été fourni dans l'URL.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Configuration du compte</CardTitle>
          <CardDescription>
            Définissez votre mot de passe pour accéder à votre espace Kiné.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show error context if available via state? No using toast. */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <PasswordInput
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Accéder à mon compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAccount;
