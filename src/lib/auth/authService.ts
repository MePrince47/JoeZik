import { User, UserProfile, LoginCredentials, RegisterData } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

// Clés de stockage
const USERS_STORAGE_KEY = 'joezik_users';
const AUTH_STORAGE_KEY = 'joezik_auth';

// Fonction pour obtenir tous les utilisateurs du stockage local
export const getUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
};

// Fonction pour sauvegarder les utilisateurs dans le stockage local
export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
  }
};

// Fonction pour obtenir un utilisateur par email
export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Fonction pour obtenir un utilisateur par ID
export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Fonction pour convertir un User en UserProfile (sans le mot de passe)
export const toUserProfile = (user: User): UserProfile => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...profile } = user;
  return profile as UserProfile;
};

// Fonction pour enregistrer un nouvel utilisateur
export const registerUser = async (data: RegisterData): Promise<UserProfile> => {
  // Vérifier si l'email est déjà utilisé
  const existingUser = getUserByEmail(data.email);
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Vérifier si les mots de passe correspondent
  if (data.password !== data.confirmPassword) {
    throw new Error('Les mots de passe ne correspondent pas');
  }

  // Générer un avatar par défaut si aucun n'est fourni
  let avatarUrl = `https://i.pravatar.cc/150?u=${data.email}`;

  // Si un avatar est fourni, le sauvegarder
  if (data.avatar) {
    try {
      // Dans une vraie application, nous téléchargerions le fichier sur un serveur
      // Pour cette démo, nous utilisons un URL d'objet local
      avatarUrl = URL.createObjectURL(data.avatar);
      
      // TODO: Implémenter le téléchargement réel du fichier
      // const formData = new FormData();
      // formData.append('avatar', data.avatar);
      // const response = await fetch('/api/upload/avatar', {
      //   method: 'POST',
      //   body: formData
      // });
      // const result = await response.json();
      // avatarUrl = result.url;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error);
    }
  }

  // Créer le nouvel utilisateur
  const newUser: User = {
    id: uuidv4(),
    username: data.username,
    email: data.email,
    password: data.password, // Dans une vraie application, nous hasherions le mot de passe
    avatarUrl,
    points: 0,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    likedTracks: []
  };

  // Sauvegarder l'utilisateur
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  // Retourner le profil utilisateur (sans le mot de passe)
  return toUserProfile(newUser);
};

// Fonction pour connecter un utilisateur
export const loginUser = (credentials: LoginCredentials): UserProfile => {
  const { email, password } = credentials;

  // Trouver l'utilisateur par email
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe
  if (user.password !== password) { // Dans une vraie application, nous comparerions les hash
    throw new Error('Email ou mot de passe incorrect');
  }

  // Créer le profil utilisateur
  const userProfile = toUserProfile(user);

  // Sauvegarder l'ID utilisateur dans le localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, user.id);

  return userProfile;
};

// Fonction pour déconnecter l'utilisateur
export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// Fonction pour vérifier si l'utilisateur est connecté
export const getCurrentUser = (): UserProfile | null => {
  try {
    const userId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userId) return null;

    const user = getUserById(userId);
    return user ? toUserProfile(user) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
    return null;
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = (userId: string, updates: Partial<UserProfile>): UserProfile => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // Mettre à jour l'utilisateur
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);
  
  return toUserProfile(users[userIndex]);
};

// Fonction pour ajouter/retirer un like sur une piste
export const toggleTrackLike = (userId: string, trackId: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const user = users[userIndex];
  const likedIndex = user.likedTracks.indexOf(trackId);
  
  if (likedIndex === -1) {
    // Ajouter le like
    user.likedTracks.push(trackId);
    saveUsers(users);
    return true; // Track is now liked
  } else {
    // Retirer le like
    user.likedTracks.splice(likedIndex, 1);
    saveUsers(users);
    return false; // Track is now unliked
  }
};

// Fonction pour vérifier si un utilisateur a aimé une piste
export const hasUserLikedTrack = (userId: string, trackId: string): boolean => {
  const user = getUserById(userId);
  return user ? user.likedTracks.includes(trackId) : false;
};

// Fonction pour ajouter des points à un utilisateur
export const addUserPoints = (userId: string, points: number): UserProfile => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }
  
  users[userIndex].points += points;
  saveUsers(users);
  
  return toUserProfile(users[userIndex]);
};
