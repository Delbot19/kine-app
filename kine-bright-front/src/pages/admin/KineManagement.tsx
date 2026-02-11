import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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


interface Kine {
  _id: string;
  specialite: string;
  numeroRPPS: string;
  presentation?: string;
  telephone?: string;
  adresse?: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    actif: boolean;
  };
}

const KineManagement = () => {
  const [kines, setKines] = useState<Kine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKines();
  }, []);

  const fetchKines = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE_URL}/kines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setKines(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching kines:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger la liste des kinés." });
    } finally {
      setLoading(false);
    }
  };

  const toggleKineStatus = async (id: string, userName: string, currentStatus: boolean) => {
    const action = currentStatus ? "désactiver" : "activer";
    if (!window.confirm(`Voulez-vous vraiment ${action} le compte de ${userName} ?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${API_BASE_URL}/kines/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Succès", description: `Compte ${action} avec succès.` });
      fetchKines();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de ${action} le compte.` });
    }
  };

  const filteredKines = kines.filter(k =>
    k.userId?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.userId?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.specialite?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Gestion des Kinésithérapeutes</h1>
          <p className="text-muted-foreground">Consultez et gérez la liste des praticiens.</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/admin/kines/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Kiné
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, spécialité..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredKines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun kiné trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom / Prénom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>RPPS</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKines.map((k) => (
                  <TableRow key={k._id}>
                    <TableCell className="font-medium">
                      {k.userId?.nom} {k.userId?.prenom}
                    </TableCell>
                    <TableCell>{k.userId?.email}</TableCell>
                    <TableCell>{k.specialite}</TableCell>
                    <TableCell>{k.numeroRPPS}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {k.telephone && <div>Tél: {k.telephone}</div>}
                        {k.adresse && <div className="text-muted-foreground truncate max-w-[150px]">{k.adresse}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${k.userId?.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {k.userId?.actif ? 'Actif' : 'Inactif'}
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
                          <DropdownMenuItem
                            className={k.userId?.actif ? "text-red-600" : "text-green-600"}
                            onClick={() => toggleKineStatus(k._id, k.userId?.nom, k.userId?.actif)}
                          >
                            {k.userId?.actif ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activer
                              </>
                            )}
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

export default KineManagement;
