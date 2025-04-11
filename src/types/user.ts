// Types pour les utilisateurs et l'authentification

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Stocké en hash dans un environnement de production
  avatarUrl: string;
  points: number;
  isAdmin: boolean;
  createdAt: string;
  likedTracks: string[]; // IDs des pistes aimées
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  points: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: File;
}
