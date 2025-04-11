import { v4 as uuidv4 } from 'uuid';
import { hasUserLikedTrack, toggleTrackLike } from '@/lib/auth/authService';
import { getAudioFileMetadataById } from '@/lib/storage/fileService';

// Clés de stockage
const TRACKS_STORAGE_KEY = 'joezik_tracks';
const PLAYLISTS_STORAGE_KEY = 'joezik_playlists';

// Interface pour les pistes
export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number;
  source: 'youtube' | 'upload';
  sourceUrl: string;
  playlistId: string;
  addedById: string;
  addedBy: string;
  voteScore: number;
  votedBy: string[]; // IDs des utilisateurs qui ont voté
  addedAt: string;
}

// Interface pour les playlists
export interface Playlist {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
}

// Fonction pour obtenir toutes les pistes
export const getTracks = (): Track[] => {
  try {
    const tracksJson = localStorage.getItem(TRACKS_STORAGE_KEY);
    return tracksJson ? JSON.parse(tracksJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pistes:', error);
    return [];
  }
};

// Fonction pour sauvegarder les pistes
export const saveTracks = (tracks: Track[]): void => {
  try {
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des pistes:', error);
  }
};

// Fonction pour obtenir toutes les playlists
export const getPlaylists = (): Playlist[] => {
  try {
    const playlistsJson = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    return playlistsJson ? JSON.parse(playlistsJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    return [];
  }
};

// Fonction pour sauvegarder les playlists
export const savePlaylists = (playlists: Playlist[]): void => {
  try {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des playlists:', error);
  }
};

// Fonction pour obtenir une piste par ID
export const getTrackById = (id: string): Track | undefined => {
  const tracks = getTracks();
  return tracks.find(track => track.id === id);
};

// Fonction pour obtenir une playlist par ID
export const getPlaylistById = (id: string): Playlist | undefined => {
  const playlists = getPlaylists();
  return playlists.find(playlist => playlist.id === id);
};

// Fonction pour obtenir les pistes d'une playlist
export const getPlaylistTracks = (playlistId: string): Track[] => {
  const tracks = getTracks();
  return tracks
    .filter(track => track.playlistId === playlistId)
    .sort((a, b) => b.voteScore - a.voteScore); // Tri par nombre de votes décroissant
};

// Fonction pour créer une nouvelle playlist
export const createPlaylist = (
  title: string,
  description: string,
  imageUrl: string,
  ownerId: string,
  isPublic: boolean = true
): Playlist => {
  const newPlaylist: Playlist = {
    id: uuidv4(),
    title,
    description,
    imageUrl,
    ownerId,
    isPublic,
    createdAt: new Date().toISOString()
  };
  
  const playlists = getPlaylists();
  playlists.push(newPlaylist);
  savePlaylists(playlists);
  
  return newPlaylist;
};

// Fonction pour ajouter une piste YouTube à une playlist
export const addYouTubeTrack = (
  playlistId: string,
  title: string,
  artist: string,
  coverUrl: string,
  duration: number,
  youtubeUrl: string,
  userId: string,
  username: string
): Track => {
  const newTrack: Track = {
    id: uuidv4(),
    title,
    artist,
    coverUrl,
    duration,
    source: 'youtube',
    sourceUrl: youtubeUrl,
    playlistId,
    addedById: userId,
    addedBy: username,
    voteScore: 0,
    votedBy: [],
    addedAt: new Date().toISOString()
  };
  
  const tracks = getTracks();
  tracks.push(newTrack);
  saveTracks(tracks);
  
  return newTrack;
};

// Fonction pour ajouter une piste uploadée à une playlist
export const addUploadTrack = (
  playlistId: string,
  title: string,
  artist: string,
  audioFileId: string,
  userId: string,
  username: string
): Track | null => {
  // Récupérer les métadonnées du fichier audio
  const audioFile = getAudioFileMetadataById(audioFileId);
  if (!audioFile) {
    return null;
  }
  
  const newTrack: Track = {
    id: uuidv4(),
    title,
    artist,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b04da49dd710937f6a57f23c', // Image par défaut
    duration: 180, // Durée par défaut
    source: 'upload',
    sourceUrl: audioFile.objectUrl,
    playlistId,
    addedById: userId,
    addedBy: username,
    voteScore: 0,
    votedBy: [],
    addedAt: new Date().toISOString()
  };
  
  const tracks = getTracks();
  tracks.push(newTrack);
  saveTracks(tracks);
  
  return newTrack;
};

// Fonction pour voter pour une piste (un seul vote par utilisateur)
export const voteForTrack = (trackId: string, userId: string): { success: boolean; voteScore: number } => {
  const tracks = getTracks();
  const trackIndex = tracks.findIndex(track => track.id === trackId);
  
  if (trackIndex === -1) {
    return { success: false, voteScore: 0 };
  }
  
  const track = tracks[trackIndex];
  
  // Vérifier si l'utilisateur a déjà voté pour cette piste
  const userVoteIndex = track.votedBy.indexOf(userId);
  
  if (userVoteIndex === -1) {
    // L'utilisateur n'a pas encore voté, ajouter son vote
    track.votedBy.push(userId);
    track.voteScore += 1;
    
    // Mettre à jour le like dans le profil utilisateur
    toggleTrackLike(userId, trackId);
  } else {
    // L'utilisateur a déjà voté, retirer son vote
    track.votedBy.splice(userVoteIndex, 1);
    track.voteScore -= 1;
    
    // Mettre à jour le like dans le profil utilisateur
    toggleTrackLike(userId, trackId);
  }
  
  saveTracks(tracks);
  
  return { success: true, voteScore: track.voteScore };
};

// Fonction pour vérifier si un utilisateur a voté pour une piste
export const hasUserVotedForTrack = (trackId: string, userId: string): boolean => {
  return hasUserLikedTrack(userId, trackId);
};

// Fonction pour supprimer une piste
export const deleteTrack = (trackId: string): boolean => {
  const tracks = getTracks();
  const trackIndex = tracks.findIndex(track => track.id === trackId);
  
  if (trackIndex === -1) {
    return false;
  }
  
  tracks.splice(trackIndex, 1);
  saveTracks(tracks);
  
  return true;
};

// Fonction pour supprimer une playlist et toutes ses pistes
export const deletePlaylist = (playlistId: string): boolean => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
  
  if (playlistIndex === -1) {
    return false;
  }
  
  // Supprimer la playlist
  playlists.splice(playlistIndex, 1);
  savePlaylists(playlists);
  
  // Supprimer toutes les pistes de la playlist
  const tracks = getTracks();
  const updatedTracks = tracks.filter(track => track.playlistId !== playlistId);
  saveTracks(updatedTracks);
  
  return true;
};
