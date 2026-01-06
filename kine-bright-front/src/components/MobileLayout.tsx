import React from 'react';
import { Heart, Calendar, BookOpen, User, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { icon: Calendar, label: 'RDV', path: '/appointments' },
    { icon: BookOpen, label: 'Ressources', path: '/resources' },
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">PhysioCenter</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 gap-1 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-1 transition-colors ${active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;