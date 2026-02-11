// Centralized configuration using Vite environment variables
// To change the API URL for deployment, set VITE_API_URL in your .env.production file

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
