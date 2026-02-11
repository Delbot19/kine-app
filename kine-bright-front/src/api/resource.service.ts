import axios from 'axios';
import { API_BASE_URL } from '@/config';

const RESOURCE_API_URL = `${API_BASE_URL}/ressources-educatives`;

export interface RessourceEducative {
  _id: string;
  titre: string;
  type: 'article' | 'video';
  slug: string;
  misEnAvant: boolean;
  description?: string;
  contenu: string;
  url?: string;
  imageUrl?: string;
  auteurId: { _id: string; nom: string; prenom: string } | string;
  datePublication: string;
  visibilite: 'public' | 'privé';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const resourceService = {
  getAll: async () => {
    const response = await axios.get(RESOURCE_API_URL, getAuthHeader());
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${RESOURCE_API_URL}/${id}`, getAuthHeader());
    return response.data.data;
  },

  search: async (term: string) => {
    const response = await axios.get(`${RESOURCE_API_URL}/search/${term}`, getAuthHeader());
    return response.data.data;
  }
};
