import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Calendar,
  Dumbbell,
  Activity,
  UserPlus,
  RefreshCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { API_BASE_URL } from '@/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Chargement du dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrateur</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre cabinet de physiothérapie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Mis à jour à {format(lastUpdated, 'HH:mm:ss')}
          </span>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Kinésithérapeutes */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Kinésithérapeutes</p>
                <h3 className="text-3xl font-bold text-primary">{stats?.kineCount || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Thérapeutes actifs</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Total */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Patients Total</p>
                <h3 className="text-3xl font-bold text-green-600">{stats?.patientCount || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Patients enregistrés</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RDV Aujourd'hui */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">RDV Aujourd'hui</p>
                <h3 className="text-3xl font-bold text-orange-500">{stats?.rdvsToday || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Rendez-vous programmés</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bibliothèque */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bibliothèque</p>
                <h3 className="text-3xl font-bold text-purple-600">{stats?.exerciseCount || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Exercices disponibles</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Dumbbell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RDV Semaine */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">RDV Semaine</p>
                <h3 className="text-3xl font-bold text-blue-500">{stats?.rdvsWeek || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taux d'Occupation */}
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Taux d'Occupation</p>
                <h3 className="text-3xl font-bold text-teal-600">{stats?.occupancyRate || 0}%</h3>
                <p className="text-xs text-muted-foreground mt-1">Moyenne hebdomadaire</p>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg">
                <Activity className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Actions Rapides</CardTitle>
            <p className="text-sm text-blue-700">Accès direct aux fonctionnalités principales</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3 bg-green-600 hover:bg-green-700 text-white" asChild>
              <Link to="/admin/kines/new">
                <UserPlus className="h-5 w-5" />
                Ajouter un Kinésithérapeute
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 bg-white hover:bg-gray-50" asChild>
              <Link to="/admin/exercices">
                <Dumbbell className="h-5 w-5 text-gray-600" />
                Gérer la Bibliothèque d'Exercices
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 bg-white hover:bg-gray-50" asChild>
              <Link to="/admin/patients">
                <Users className="h-5 w-5 text-gray-600" />
                Vue Globale des Patients
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Activité Récente</CardTitle>
            <p className="text-sm text-muted-foreground">Dernières actions dans le système</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className={`mt-0.5 p-1 rounded-full ${activity.type === 'user_register' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'rdv_created' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                      }`}>
                      {activity.type === 'user_register' ? <UserPlus className="h-3 w-3" /> :
                        <Calendar className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.date), "d MMM à HH:mm", { locale: fr })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucune activité récente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AdminDashboard;
