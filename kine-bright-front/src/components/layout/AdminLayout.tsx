import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/ui/nav-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Dumbbell,
  LogOut,
  Menu,
  Stethoscope,
  BookOpen
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/kines', label: 'Gestion Kinés', icon: Stethoscope }, // Changed from Users to Stethoscope for Kines
  { path: '/admin/patients', label: 'Gestion Patients', icon: Users },
  { path: '/admin/exercices', label: 'Bibliothèque Exercices', icon: Dumbbell },
  { path: '/admin/ressources', label: 'Ressources Éducatives', icon: BookOpen },
];

const AdminSidebar = ({ className }: { className?: string }) => {
  const { logout } = useAuth();
  return (
    <aside className={`w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col h-full overflow-y-auto z-50 ${className || 'fixed left-0 top-0 bottom-0 hidden lg:flex'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#1e3a5f]">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Cabinet PhysioCenter</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-gray-50 transition-colors"
            activeClassName="bg-primary text-white hover:bg-primary text-white"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#1e3a5f]">Admin Panel</h1>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar className="flex h-full w-full" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
