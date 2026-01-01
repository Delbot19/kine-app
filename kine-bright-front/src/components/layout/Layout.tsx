import React, { useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal de l'application
 * Contient le header, la navbar responsive et le footer
 */
const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header fixe */}
      <Header 
        onMenuToggle={handleMenuToggle} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />
      
      {/* Navigation mobile uniquement */}
      <Navbar 
        isMobileMenuOpen={isMobileMenuOpen} 
        onMobileMenuClose={handleMobileMenuClose} 
      />

      {/* Contenu principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;