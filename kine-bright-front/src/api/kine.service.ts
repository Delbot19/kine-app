import axios from 'axios';

import { API_BASE_URL } from '@/config';

export interface KineProfile {
  _id: string;
  specialite: string;
  numeroRPPS: string;
  presentation?: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}` };
};

export const kineService = {
  // Get current authenticated Kine profile
  getMe: async (): Promise<KineProfile> => {
    const response = await axios.get(`${API_BASE_URL}/kines/me`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },
};
