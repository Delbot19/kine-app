import React from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header = ({ onMenuToggle, isMobileMenuOpen }: HeaderProps) => {
  const { logout } = useAuth();

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo et nom du site */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-full shadow-medical">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent">
              PhysioCenter
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Votre centre de kinésithérapie
            </p>
          </div>
        </div>

        {/* Navigation centrale - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Accueil
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            À propos
          </Link>
          <Link
            to="/resources"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Ressources
          </Link>
          <Link
            to="/contact"
            className="text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
            Déconnexion
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="text-foreground"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;