import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/ui/nav-link';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  User,
  LogOut
} from 'lucide-react';

const navItems = [
  { path: '/kine/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/kine/patients', label: 'Gestion des Patients', icon: Users },
  { path: '/kine/planning', label: 'Planning & Rendez-vous', icon: Calendar },
  { path: '/kine/traitements', label: 'Traitements', icon: Stethoscope },
  { path: '/kine/prescriptions', label: 'Prescriptions', icon: FileText },
  { path: '/kine/profil', label: 'Profil', icon: User },
];

interface KineSidebarProps {
  className?: string;
}

const KineSidebar = ({ className }: KineSidebarProps) => {
  const { logout } = useAuth();
  return (
    <aside className={`w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col h-full overflow-y-auto z-50 ${className || 'fixed left-0 top-0 bottom-0 hidden lg:flex'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#1e3a5f]">PhysioCenter</h1>
        <p className="text-sm text-muted-foreground">Espace Professionnel</p>
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

export default KineSidebar;
