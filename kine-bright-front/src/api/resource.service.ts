import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/ressources-educatives';

export interface RessourceEducative {
  _id: string;
  titre: string;
  type: 'article' | 'video';
  description?: string;
  contenu?: string;
  url?: string;
  auteurId: { _id: string; nom: string; prenom: string } | string;
  datePublication: string;
  visibilite: 'public' | 'privé';
  tags?: string[];
  imageUrl?: string;
  createdAt: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const resourceService = {
  getAll: async () => {
    const response = await axios.get(API_BASE_URL, getAuthHeader());
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`, getAuthHeader());
    return response.data.data;
  },

  search: async (term: string) => {
    const response = await axios.get(`${API_BASE_URL}/search/${term}`, getAuthHeader());
    return response.data.data;
  }
};
