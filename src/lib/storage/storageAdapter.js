// Adaptateur de stockage pour faciliter la migration entre localStorage et SQLite

// Configuration pour déterminer quel stockage utiliser
// Cette variable peut être définie dans un fichier de configuration ou via une variable d'environnement
export const USE_SQLITE = process.env.NEXT_PUBLIC_USE_SQLITE === 'true';

// Fonction pour importer dynamiquement le service d'authentification approprié
export const getAuthService = async () => {
  if (USE_SQLITE) {
    return import('../auth/authServiceSQLite');
  } else {
    return import('../auth/authService');
  }
};

// Fonction pour importer dynamiquement le service de playlist approprié
export const getTrackService = async () => {
  if (USE_SQLITE) {
    return import('../playlist/trackServiceSQLite');
  } else {
    return import('../playlist/trackService');
  }
};

// Fonction pour importer dynamiquement le service de fichiers approprié
export const getFileService = async () => {
  if (USE_SQLITE) {
    return import('../storage/fileServiceSQLite');
  } else {
    return import('../storage/fileService');
  }
};

// Fonction pour importer dynamiquement le service de chat approprié
export const getChatService = async () => {
  if (USE_SQLITE) {
    return import('../chat/chatServiceSQLite');
  } else {
    return import('../chat/chatService');
  }
};

// Fonction pour migrer les données de localStorage vers SQLite
export const migrateToSQLite = async () => {
  if (typeof window === 'undefined') {
    return; // Ne pas exécuter côté serveur
  }
  
  try {
    // Récupérer les données du localStorage
    const users = JSON.parse(localStorage.getItem('joezik_users') || '[]');
    const playlists = JSON.parse(localStorage.getItem('joezik_playlists') || '[]');
    const tracks = JSON.parse(localStorage.getItem('joezik_tracks') || '[]');
    const chatMessages = JSON.parse(localStorage.getItem('joezik_chat_messages') || '[]');
    const audioFiles = JSON.parse(localStorage.getItem('joezik_audio_files') || '[]');
    
    // Envoyer les données au serveur pour migration
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        users,
        playlists,
        tracks,
        chatMessages,
        audioFiles
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la migration des données');
    }
    
    const result = await response.json();
    console.log('Migration réussie:', result);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    throw error;
  }
};
