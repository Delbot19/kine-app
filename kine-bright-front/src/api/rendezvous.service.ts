import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface RendezVous {
  _id: string;
  date: string; // ISO string
  duree: number;
  patientId: {
    _id: string;
    userId: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
  kineId: string;
  statut: 'en attente' | 'à venir' | 'annulé' | 'terminé';
  motif?: string | { titre: string; description: string };
}

export interface CreateRendezVousRequest {
  patientId: string;
  kineId: string;
  date: string;
  duree?: number;
  motif?: string | { titre: string; description: string };
  statut?: 'en attente' | 'à venir' | 'annulé' | 'terminé';
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}` };
};

export const rendezvousService = {
  // Get appointments by Kiné and Date (Start Date)
  getByKineAndDate: async (kineId: string, date: Date): Promise<RendezVous[]> => {
    // API expects date string. We send the start of the week/view.
    const dateStr = date.toISOString();
    const response = await axios.get(`${API_BASE_URL}/rdvs`, {
      params: { kineId, date: dateStr },
      headers: getAuthHeader(),
    });
    return response.data.data; // data.data contains the list based on jsonResponse util
  },

  // Create appointment
  create: async (data: CreateRendezVousRequest): Promise<RendezVous> => {
    const response = await axios.post(`${API_BASE_URL}/rdvs`, data, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  // Get patients for a specific Kiné (for dropdown)
  getPatientsByKine: async (kineId: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/rdvs/patients/${kineId}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  // Cancel appointment
  cancel: async (id: string): Promise<RendezVous> => {
    const response = await axios.patch(`${API_BASE_URL}/rdvs/${id}/cancel`, {}, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  // Update appointment (for rescheduling)
  update: async (id: string, data: Partial<CreateRendezVousRequest>): Promise<RendezVous> => {
    const response = await axios.put(`${API_BASE_URL}/rdvs/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  }
};
