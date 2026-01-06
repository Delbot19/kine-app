import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { handleAxiosError } from "@/utils/handleAxiosError";

const API_BASE_URL = "http://localhost:8000/api";

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  sexe: "H" | "F";
  dateNaissance: string;
  adresse: string;
  telephone: string;
  groupeSanguin?: string;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  sexe?: "H" | "F";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    user: User;
    patient: {
      id: string;
      userId: string;
      sexe: string;
      dateNaissance: string;
      adresse: string;
      telephone: string;
      groupeSanguin?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string; user?: User; patient?: RegisterResponse['data']['patient'] }>;
  logout: () => void;
  checkAuth: () => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const response = await axios.post<LoginResponse>(
          `${API_BASE_URL}/auth/login`,
          credentials
        );
        const data = response.data.data;

        if (data.success && data.token && data.user) {
          localStorage.setItem("authToken", data.token);
          setUser(data.user);

          toast({
            title: "Connexion réussie",
            description: `Bienvenue ${data.user.prenom} ${data.user.nom}`,
          });

          return { success: true };
        } else {
          throw new Error(data.message || "Erreur de connexion");
        }
      } catch (error) {
        const errorMessage = handleAxiosError(error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      setIsLoading(true);
      try {
        const response = await axios.post<RegisterResponse>(
          `${API_BASE_URL}/patients`,
          userData
        );
        const data = response.data.data;

        if (!data.success) {
          throw new Error(
            data.message || "Erreur lors de la création du patient"
          );
        }

        toast({
          title: "Inscription réussie",
          description:
            "Votre compte patient a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });

        return {
          success: true,
          user: data.user,
          patient: data.patient,
        };
      } catch (error) {
        const errorMessage = handleAxiosError(error);
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);

    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    window.location.href = '/login';
  }, [toast]);

  const checkAuth = useCallback(() => {
    return !!localStorage.getItem('authToken');
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user || !!localStorage.getItem('authToken'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};