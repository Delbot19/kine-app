import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Patient {
  _id: string;
  userId: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    sexe?: 'H' | 'F';
  };
  sexe: 'H' | 'F';
  dateNaissance: string;
  adresse: string;
  telephone: string;
  groupeSanguin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePatientRequest {
  adresse?: string;
  telephone?: string;
  groupeSanguin?: string; // Add other fields if allowed to update
}

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return { Authorization: `Bearer ${token}` };
};

export const patientService = {
  // Get patient by User ID
  getByUserId: async (userId: string): Promise<Patient> => {
    const response = await axios.get(`${API_BASE_URL}/patients/by-user/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  // Get patient by Patient ID
  getById: async (id: string): Promise<Patient> => {
    const response = await axios.get(`${API_BASE_URL}/patients/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  // Update patient
  update: async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await axios.put(`${API_BASE_URL}/patients/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },
};
