import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  tip: string;
  difficulty: "Facile" | "Modéré" | "Difficile";
  icon: "target" | "refresh" | "zap" | "circle";
  completed: boolean;
  instructions?: string;
}

export const exerciseService = {
  /**
   * Get exercises for the current patient for today
   */
  getTodayExercises: async (): Promise<Exercise[]> => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/exercises/patient/today`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  /**
   * Toggle exercise completion status
   */
  toggleCompletion: async (
    id: string,
    completed: boolean,
    feedback?: {
      douleur?: number;
      difficulte?: string;
      ressenti?: string;
      modifications?: string;
    }
  ): Promise<any> => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${API_BASE_URL}/exercises/${id}/toggle`, // Note: Ensure this matches backend route /:id/toggle
      { completed, ...feedback },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }
};
