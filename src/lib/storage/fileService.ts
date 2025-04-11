// Service pour gérer le stockage et la récupération des fichiers audio

// Clés de stockage
const AUDIO_FILES_STORAGE_KEY = 'joezik_audio_files';

// Interface pour les métadonnées des fichiers audio
interface AudioFileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  objectUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Fonction pour obtenir toutes les métadonnées des fichiers audio
export const getAudioFilesMetadata = (): AudioFileMetadata[] => {
  try {
    const metadataJson = localStorage.getItem(AUDIO_FILES_STORAGE_KEY);
    return metadataJson ? JSON.parse(metadataJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées des fichiers audio:', error);
    return [];
  }
};

// Fonction pour sauvegarder les métadonnées des fichiers audio
export const saveAudioFilesMetadata = (metadata: AudioFileMetadata[]): void => {
  try {
    localStorage.setItem(AUDIO_FILES_STORAGE_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des métadonnées des fichiers audio:', error);
  }
};

// Fonction pour obtenir les métadonnées d'un fichier audio par ID
export const getAudioFileMetadataById = (id: string): AudioFileMetadata | undefined => {
  const metadata = getAudioFilesMetadata();
  return metadata.find(file => file.id === id);
};

// Fonction pour sauvegarder un fichier audio
export const saveAudioFile = (file: File, userId: string): AudioFileMetadata => {
  // Créer un URL d'objet pour le fichier
  const objectUrl = URL.createObjectURL(file);
  
  // Créer les métadonnées du fichier
  const metadata: AudioFileMetadata = {
    id: `${Date.now()}-${file.name}`,
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    objectUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId
  };
  
  // Sauvegarder les métadonnées
  const allMetadata = getAudioFilesMetadata();
  allMetadata.push(metadata);
  saveAudioFilesMetadata(allMetadata);
  
  return metadata;
};

// Fonction pour supprimer un fichier audio
export const deleteAudioFile = (id: string): boolean => {
  const metadata = getAudioFilesMetadata();
  const fileIndex = metadata.findIndex(file => file.id === id);
  
  if (fileIndex === -1) {
    return false;
  }
  
  // Libérer l'URL d'objet
  URL.revokeObjectURL(metadata[fileIndex].objectUrl);
  
  // Supprimer les métadonnées
  metadata.splice(fileIndex, 1);
  saveAudioFilesMetadata(metadata);
  
  return true;
};

// Fonction pour obtenir l'URL d'un fichier audio
export const getAudioFileUrl = (id: string): string | null => {
  const metadata = getAudioFileMetadataById(id);
  return metadata ? metadata.objectUrl : null;
};

// Fonction pour obtenir tous les fichiers audio d'un utilisateur
export const getUserAudioFiles = (userId: string): AudioFileMetadata[] => {
  const metadata = getAudioFilesMetadata();
  return metadata.filter(file => file.uploadedBy === userId);
};
