import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Shield, Users, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-medical-bg.jpg';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({
      email,
      motDePasse: password
    });

    if (result.success && result.user) {
      if (result.user.role === 'kinesitherapeute' || result.user.role === 'kine') {
        navigate('/kine/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary-glow/40" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Heart className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">PhysioCenter</h1>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Votre partenaire de confiance pour une rééducation moderne et personnalisée
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sécurité des données</h3>
                <p className="text-sm opacity-75">Vos informations médicales protégées selon les normes RGPD</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Équipe experte</h3>
                <p className="text-sm opacity-75">Kinésithérapeutes diplômés et spécialisés</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Disponibilité 24/7</h3>
                <p className="text-sm opacity-75">Accès à votre dossier et suivi en continu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PhysioCenter</h1>
            </div>
          </div>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Connexion</CardTitle>
              <CardDescription>
                Accédez à votre espace patient sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:shadow-medical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:shadow-medical"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label
                      htmlFor="remember"
                      className="text-sm cursor-pointer"
                    >
                      Se souvenir de moi
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary-glow transition-colors"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:shadow-medical transition-all duration-300"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Pas encore de compte patient ?{' '}
                <Link to="/register" className="text-primary hover:text-primary-glow transition-colors">
                  Créer un compte
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>© 2024 PhysioCenter. Tous droits réservés.</p>
            <p className="mt-1">
              <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
              {' • '}
              <a href="#" className="hover:text-primary transition-colors">Conditions</a>
              {' • '}
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}