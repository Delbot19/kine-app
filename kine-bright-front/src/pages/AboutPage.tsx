import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Shield, Users, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Votre santé, notre priorité
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Nous réinventons le suivi kinésithérapique pour le rendre plus accessible, plus efficace et plus humain.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/contact">
            <Button size="lg" className="rounded-full px-8">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>

      {/* Our Mission */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold">Notre Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Chez PhysioCenter, nous croyons que chaque patient mérite un accompagnement personnalisé et continu. Notre mission est de briser les barrières entre les séances en cabinet et le quotidien, grâce à des outils numériques innovants qui prolongent le soin à domicile.
          </p>
          <ul className="space-y-3">
            {['Suivi personnalisé', 'Accessibilité 24/7', 'Exercices adaptés'].map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-muted h-[400px] flex items-center justify-center">
          {/* Placeholder for an image - using an icon for now */}
          <Users className="w-32 h-32 text-muted-foreground/20" />
        </div>
      </section>

      {/* Our Values */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Nos Valeurs</h2>
          <p className="text-muted-foreground">
            Trois piliers fondamentaux guident chacune de nos actions et décisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Empathie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                L'humain est au cœur de notre métier. Nous écoutons, comprenons et adaptons nos soins à chaque trajectoire de vie.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous exploitons le meilleur de la technologie pour améliorer la précision des diagnostics et l'efficacité des traitements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous nous engageons à maintenir les plus hauts standards de pratique clinique et de formation continue.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Us? */}
      <section className="bg-muted/50 rounded-3xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Shield className="w-12 h-12 mx-auto text-primary" />
          <h2 className="text-3xl font-bold">Pourquoi nous choisir ?</h2>
          <p className="text-lg text-muted-foreground">
            Au-delà des séances, nous vous offrons un véritable écosystème de santé. Avec PhysioCenter, vous devenez acteur de votre rééducation, soutenu par une équipe dévouée et des outils de pointe.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
