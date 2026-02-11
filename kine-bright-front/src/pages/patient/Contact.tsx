import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';

import { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: `${formData.firstname} ${formData.lastname}`,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      const response = await axios.post(`${API_BASE_URL}/contact`, payload);

      if (response.data.success) {
        toast({
          title: "Message envoyé !",
          description: "Nous avons bien reçu votre message et vous répondrons bientôt.",
          variant: "default", // Success usually green or default
        });
        // Reset form
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const msg = error.response?.data?.message || "Une erreur est survenue lors de l'envoi.";
      toast({
        title: "Erreur",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Contactez-nous
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une question ? Besoin d'un renseignement ? Notre équipe est à votre écoute.
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-none shadow-lg h-full">
            <CardHeader>
              <CardTitle>Nos Coordonnées</CardTitle>
              <CardDescription>
                Retrouvez-nous facilement ou contactez-nous directement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Adresse</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cabinet kinesitherapie, Maro militaire, rue 7.038, Cotonou
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Téléphone</h3>
                  <p className="text-muted-foreground text-sm">
                    01 51 87 64 34
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Du lundi au vendredi, 9h-18h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">
                    contact@physiocenter.fr
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Horaires d'ouverture</h3>
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p className="flex justify-between gap-4"><span>Lun - Ven:</span> <span>08:00 - 18:00</span></p>
                    <p className="flex justify-between gap-4"><span>Samedi:</span> <span>09:00 - 13:00</span></p>
                    <p className="flex justify-between gap-4"><span>Dimanche:</span> <span>Fermé</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input
                      id="firstname"
                      placeholder="Votre prénom"
                      required
                      value={formData.firstname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input
                      id="lastname"
                      placeholder="Votre nom"
                      required
                      value={formData.lastname}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    placeholder="Objet de votre demande"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="min-h-[150px]"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
