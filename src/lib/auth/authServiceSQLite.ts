import { User, UserProfile, LoginCredentials, RegisterData } from '@/types/user';

// Fonction pour convertir un User en UserProfile (sans le mot de passe)
export const toUserProfile = (user: User): UserProfile => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...profile } = user;
  return profile as UserProfile;
};

// Fonction pour enregistrer un nouvel utilisateur
export const registerUser = async (data: RegisterData): Promise<UserProfile> => {
  try {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
    }
    
    const userProfile = await response.json();
    
    return userProfile;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    throw error;
  }
};

// Fonction pour connecter un utilisateur
export const loginUser = async (credentials: LoginCredentials): Promise<UserProfile> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la connexion');
    }
    
    const userProfile = await response.json();
    
    // Sauvegarder l'ID utilisateur dans le localStorage
    localStorage.setItem('joezik_auth', userProfile.id);
    
    return userProfile;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Fonction pour déconnecter l'utilisateur
export const logoutUser = (): void => {
  localStorage.removeItem('joezik_auth');
};

// Fonction pour vérifier si l'utilisateur est connecté
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const userId = localStorage.getItem('joezik_auth');
    if (!userId) return null;
    
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
    return null;
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// Fonction pour ajouter/retirer un like sur une piste
export const toggleTrackLike = async (userId: string, trackId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/tracks/${trackId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors du vote');
    }
    
    const result = await response.json();
    return result.action === 'added';
  } catch (error) {
    console.error('Erreur lors du vote:', error);
    throw error;
  }
};

// Fonction pour vérifier si un utilisateur a aimé une piste
export const hasUserLikedTrack = async (userId: string, trackId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${userId}/likes?trackId=${trackId}`);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.liked;
  } catch (error) {
    console.error('Erreur lors de la vérification du like:', error);
    return false;
  }
};

// Fonction pour ajouter des points à un utilisateur
export const addUserPoints = async (userId: string, points: number): Promise<UserProfile> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }
    
    const response = await fetch(`/api/users/${userId}/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout de points');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de points:', error);
    throw error;
  }
};
