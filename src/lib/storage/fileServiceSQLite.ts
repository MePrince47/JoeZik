// Service pour gérer le stockage et la récupération des fichiers audio avec SQLite

// Interface pour les métadonnées des fichiers audio
interface AudioFileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  filePath: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Fonction pour obtenir toutes les métadonnées des fichiers audio
export const getAudioFilesMetadata = async (): Promise<AudioFileMetadata[]> => {
  try {
    const response = await fetch('/api/upload');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des métadonnées des fichiers audio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées des fichiers audio:', error);
    return [];
  }
};

// Fonction pour obtenir les métadonnées d'un fichier audio par ID
export const getAudioFileMetadataById = async (id: string): Promise<AudioFileMetadata | undefined> => {
  try {
    const response = await fetch(`/api/upload?id=${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error('Erreur lors de la récupération des métadonnées du fichier audio');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des métadonnées du fichier audio ${id}:`, error);
    return undefined;
  }
};

// Fonction pour sauvegarder un fichier audio
export const saveAudioFile = async (file: File, userId: string): Promise<AudioFileMetadata> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors du téléchargement du fichier audio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier audio:', error);
    throw error;
  }
};

// Fonction pour supprimer un fichier audio
export const deleteAudioFile = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/upload?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression du fichier audio');
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier audio ${id}:`, error);
    return false;
  }
};

// Fonction pour obtenir l'URL d'un fichier audio
export const getAudioFileUrl = async (id: string): Promise<string | null> => {
  try {
    const metadata = await getAudioFileMetadataById(id);
    return metadata ? metadata.filePath : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'URL du fichier audio ${id}:`, error);
    return null;
  }
};

// Fonction pour obtenir tous les fichiers audio d'un utilisateur
export const getUserAudioFiles = async (userId: string): Promise<AudioFileMetadata[]> => {
  try {
    const response = await fetch(`/api/upload?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des fichiers audio de l\'utilisateur');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des fichiers audio de l'utilisateur ${userId}:`, error);
    return [];
  }
};
