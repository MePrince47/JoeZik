import { Track, Playlist } from './trackService';

// Fonction pour obtenir toutes les pistes
export const getTracks = async (): Promise<Track[]> => {
  try {
    const response = await fetch('/api/tracks');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des pistes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des pistes:', error);
    return [];
  }
};

// Fonction pour obtenir toutes les playlists
export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const response = await fetch('/api/playlists');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des playlists');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    return [];
  }
};

// Fonction pour obtenir une piste par ID
export const getTrackById = async (id: string): Promise<Track | undefined> => {
  try {
    const response = await fetch(`/api/tracks/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error('Erreur lors de la récupération de la piste');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération de la piste ${id}:`, error);
    return undefined;
  }
};

// Fonction pour obtenir une playlist par ID
export const getPlaylistById = async (id: string): Promise<Playlist | undefined> => {
  try {
    const response = await fetch(`/api/playlists/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error('Erreur lors de la récupération de la playlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération de la playlist ${id}:`, error);
    return undefined;
  }
};

// Fonction pour obtenir les pistes d'une playlist
export const getPlaylistTracks = async (playlistId: string, sortBy: 'votes' | 'date' = 'votes'): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/tracks?playlistId=${playlistId}&sortBy=${sortBy}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des pistes de la playlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des pistes de la playlist ${playlistId}:`, error);
    return [];
  }
};

// Fonction pour créer une nouvelle playlist
export const createPlaylist = async (
  title: string,
  description: string,
  imageUrl: string,
  ownerId: string,
  isPublic: boolean = true
): Promise<Playlist> => {
  try {
    const response = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        ownerId,
        isPublic
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la playlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la playlist:', error);
    throw error;
  }
};

// Fonction pour ajouter une piste YouTube à une playlist
export const addYouTubeTrack = async (
  playlistId: string,
  title: string,
  artist: string,
  coverUrl: string,
  duration: number,
  youtubeUrl: string,
  userId: string,
  username: string
): Promise<Track> => {
  try {
    const response = await fetch('/api/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        artist,
        coverUrl,
        duration,
        source: 'youtube',
        sourceUrl: youtubeUrl,
        playlistId,
        addedById: userId,
        addedBy: username
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout de la piste YouTube');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la piste YouTube:', error);
    throw error;
  }
};

// Fonction pour ajouter une piste uploadée à une playlist
export const addUploadTrack = async (
  playlistId: string,
  title: string,
  artist: string,
  audioFileId: string,
  userId: string,
  username: string
): Promise<Track | null> => {
  try {
    // Récupérer les métadonnées du fichier audio
    const audioFileResponse = await fetch(`/api/upload?id=${audioFileId}`);
    
    if (!audioFileResponse.ok) {
      throw new Error('Fichier audio non trouvé');
    }
    
    const audioFile = await audioFileResponse.json();
    
    const response = await fetch('/api/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        artist,
        coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b04da49dd710937f6a57f23c', // Image par défaut
        duration: 180, // Durée par défaut
        source: 'upload',
        sourceUrl: audioFile.filePath,
        playlistId,
        addedById: userId,
        addedBy: username
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout de la piste uploadée');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la piste uploadée:', error);
    return null;
  }
};

// Fonction pour voter pour une piste
export const voteForTrack = async (trackId: string, userId: string): Promise<{ success: boolean; voteScore: number }> => {
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
      throw new Error(errorData.error || 'Erreur lors du vote pour la piste');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      voteScore: result.voteScore
    };
  } catch (error) {
    console.error(`Erreur lors du vote pour la piste ${trackId}:`, error);
    return { success: false, voteScore: 0 };
  }
};

// Fonction pour vérifier si un utilisateur a voté pour une piste
export const hasUserVotedForTrack = async (trackId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${userId}/likes?trackId=${trackId}`);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.liked;
  } catch (error) {
    console.error(`Erreur lors de la vérification du vote pour la piste ${trackId}:`, error);
    return false;
  }
};

// Fonction pour supprimer une piste
export const deleteTrack = async (trackId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/tracks/${trackId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la piste');
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la piste ${trackId}:`, error);
    return false;
  }
};

// Fonction pour supprimer une playlist et toutes ses pistes
export const deletePlaylist = async (playlistId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/playlists/${playlistId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la playlist');
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la playlist ${playlistId}:`, error);
    return false;
  }
};
