import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  User,
  LogOut,
  FileText,
  Phone,
  Activity,
  BookOpen,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

const Navbar = ({ isMobileMenuOpen, onMobileMenuClose }: NavbarProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigationItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Calendar, label: 'Mes rendez-vous', path: '/appointments' },
    { icon: Activity, label: 'Mon traitement', path: '/treatment' },
    { icon: FileText, label: 'Mes exercices', path: '/exercises' },
    { icon: BookOpen, label: 'Ressources éducatives', path: '/resources' },
    { icon: User, label: 'Mon profil', path: '/profile' },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onMobileMenuClose();
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onMobileMenuClose} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-card border-l border-border shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuClose}
                className="text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-primary text-primary-foreground shadow-medical"
                            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}

                {/* Déconnexion pour mobile */}
                <li className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      onMobileMenuClose();
                    }}
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;