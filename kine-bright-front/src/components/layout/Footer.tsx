import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-full">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">PhysioCenter</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre centre de kinésithérapie de confiance. 
              Nous vous accompagnons dans votre rééducation avec expertise et bienveillance.
            </p>
          </div>

          {/* Liens utiles */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Liens utiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Nos services
                </Link>
              </li>
              <li>
                <Link 
                  to="/team" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Notre équipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Conditions générales d'utilisation
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Politique des cookies
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact et réseaux sociaux */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@physiocenter.fr</span>
              </div>
              <div className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Avenue de la Santé<br />75000 Paris, France</span>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="pt-4">
              <h5 className="text-sm font-medium text-foreground mb-3">Suivez-nous</h5>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} PhysioCenter. Tous droits réservés.
            </p>
            <p className="text-sm text-muted-foreground">
              Développé avec ❤️ pour votre bien-être
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;