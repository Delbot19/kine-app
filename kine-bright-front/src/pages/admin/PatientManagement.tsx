import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Trash2, UserPlus, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { API_BASE_URL } from '@/config';
import { Link } from 'react-router-dom';

interface Patient {
  _id: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    actif: boolean;
  };
  kineId?: {
    _id: string;
    userId: {
      nom: string;
      prenom: string;
    }
  };
  telephone?: string;
  pathologie?: string;
  statut?: string;
}

interface Kine {
  _id: string;
  userId: {
    nom: string;
    prenom: string;
  }
}

const PatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [kines, setKines] = useState<Kine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKineFilter, setSelectedKineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [patientsRes, kinesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/patients`, config),
        axios.get(`${API_BASE_URL}/kines`, config)
      ]);

      if (patientsRes.data.success) {
        setPatients(patientsRes.data.data);
      }
      if (kinesRes.data.success) {
        setKines(kinesRes.data.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données." });
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id: string, userName: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le patient ${userName} ? Cette action supprimera également son compte utilisateur.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Succès", description: "Patient supprimé." });
      // Refresh list locally
      setPatients(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le patient." });
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.userId?.nom} ${p.userId?.prenom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      p.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKine = selectedKineFilter === 'all' || p.kineId?._id === selectedKineFilter;
    const matchesStatus = statusFilter === 'all' || p.statut === statusFilter;

    return matchesSearch && matchesKine && matchesStatus;
  });

  const counts = {
    all: patients.length,
    actif: patients.filter(p => p.statut === 'actif').length,
    en_pause: patients.filter(p => p.statut === 'en_pause').length,
    termine: patients.filter(p => p.statut === 'termine').length,
  };

  const filters = [
    { key: 'all', label: `Tous (${counts.all})` },
    { key: 'actif', label: `Actifs (${counts.actif})` },
    { key: 'en_pause', label: `En pause (${counts.en_pause})` },
    { key: 'termine', label: `Terminés (${counts.termine})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Gestion des Patients</h1>
          <p className="text-muted-foreground mt-1">Consultez et gérez la liste complète des patients.</p>
        </div>
      </div>

      <Card className="p-4 mb-6 bg-white border-none shadow-card">
        <div className="flex flex-col xl:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient (nom, email...)"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Kine Filter */}
          <div className="w-full xl:w-[250px]">
            <Select value={selectedKineFilter} onValueChange={setSelectedKineFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par Kiné" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les kinés</SelectItem>
                {kines.map(k => (
                  <SelectItem key={k._id} value={k._id}>
                    {k.userId?.nom} {k.userId?.prenom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
                className={
                  statusFilter === filter.key && filter.key === 'all'
                    ? 'gap-2 whitespace-nowrap'
                    : 'whitespace-nowrap'
                }
              >
                {filter.key === 'all' && statusFilter === 'all' && (
                  <Filter className="h-4 w-4" />
                )}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun patient trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Kiné Assigné</TableHead>
                  <TableHead>Pathologie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">
                      {p.userId?.nom} {p.userId?.prenom}
                      {p.telephone && <div className="text-xs text-muted-foreground">{p.telephone}</div>}
                    </TableCell>
                    <TableCell>{p.userId?.email}</TableCell>
                    <TableCell>
                      {p.kineId ? (
                        <span className="font-medium text-primary">
                          {p.kineId.userId.nom} {p.kineId.userId.prenom}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell>{p.pathologie || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.statut === 'actif' ? 'bg-green-100 text-green-800' :
                        p.statut === 'termine' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {p.statut || 'Inconnu'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600" onClick={() => deletePatient(p._id, `${p.userId?.nom} ${p.userId?.prenom}`)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientManagement;
