'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Player from '@/components/player/Player';
import TrackQueue from '@/components/playlist/TrackQueue';
import UsersChat from '@/components/realtime/UsersChat';
import AddTrackForm from '@/components/playlist/AddTrackForm';
// Types
import { UserProfile } from '@/types/user';

// Services
import { 
  getCurrentUser, 
  registerUser, 
  logoutUser
} from '@/lib/auth/authService';
import { 
  saveAudioFile
} from '@/lib/storage/fileService';
import { 
  Track, 
  getPlaylistTracks, 
  addYouTubeTrack, 
  addUploadTrack, 
  voteForTrack
} from '@/lib/playlist/trackService';

// Fonction utilitaire pour extraire l'ID YouTube d'une URL
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Fonction utilitaire pour extraire les métadonnées d'une vidéo YouTube
async function getYouTubeVideoInfo(videoId: string): Promise<{title: string, artist: string, thumbnailUrl: string, duration: number} | null> {
  try {
    // Dans une vraie application, vous feriez une requête à l'API YouTube
    // Pour cette démo, nous simulons une réponse après un court délai
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Données mockées basées sur l'ID de la vidéo
    const mockData: Record<string, {title: string, artist: string, thumbnailUrl: string, duration: number}> = {
      'fJ9rUzIMcZQ': {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        thumbnailUrl: 'https://i.scdn.co/image/ab67616d0000b273c79b600289a80aaef74d155d',
        duration: 354
      },
      'Zi_XLOBDo_Y': {
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        thumbnailUrl: 'https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97',
        duration: 294
      },
      '1w7OgIMMRc4': {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        thumbnailUrl: 'https://i.scdn.co/image/ab67616d0000b273bdba586eb69c503f7ff7d7e4',
        duration: 356
      }
    };
    
    // Si nous avons des données mockées pour cet ID, retournez-les
    if (mockData[videoId]) {
      return mockData[videoId];
    }
    
    // Sinon, retournez des données génériques
    return {
      title: `YouTube Video (${videoId})`,
      artist: 'Unknown Artist',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      duration: 240
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des infos vidéo:', error);
    return null;
  }
}

// Constantes
const DEFAULT_PLAYLIST_ID = 'default-playlist';

export default function Home() {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [roomName] = useState('Chill Vibes');
  const [playerReady, setPlayerReady] = useState(false);
  const [playerState, setPlayerState] = useState<'playing' | 'paused' | 'ended'>('paused');
  const [playerProgress, setPlayerProgress] = useState(0);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Charger l'utilisateur actuel et les pistes au chargement de la page
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      // Si aucun utilisateur n'est connecté, afficher la modal de connexion
      setShowLoginModal(true);
    }

    // Charger les pistes de la playlist par défaut
    const playlistTracks = getPlaylistTracks(DEFAULT_PLAYLIST_ID);
    setTracks(playlistTracks);
    
    // Si des pistes sont disponibles, sélectionner la première
    if (playlistTracks.length > 0) {
      setCurrentTrackId(playlistTracks[0].id);
    }
    
    // Simuler des utilisateurs en ligne (dans une vraie application, cela viendrait d'un service de présence)
    if (user) {
      setOnlineUsers([user]);
    }
  }, []);

  // Get current track
  const currentTrack = tracks.find(track => track.id === currentTrackId) || null;

  // Effet pour gérer la fin d'une piste
  useEffect(() => {
    if (playerState === 'ended') {
      handleNext();
    }
  }, [playerState]);

  // Handlers
  const handlePlayPause = () => {
    console.log('Play/Pause clicked, current state:', isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentTrackId) return;
    
    console.log('Next track clicked');
    const currentIndex = tracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex < tracks.length - 1) {
      setCurrentTrackId(tracks[currentIndex + 1].id);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (!currentTrackId) return;
    
    console.log('Previous track clicked');
    const currentIndex = tracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex > 0) {
      setCurrentTrackId(tracks[currentIndex - 1].id);
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    console.log('Track selected:', trackId);
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const handleVoteUp = (trackId: string) => {
    console.log('Vote up for track:', trackId);
    if (currentUser) {
      const result = voteForTrack(trackId, currentUser.id);
      if (result.success) {
        // Mettre à jour les pistes après le vote
        setTracks(getPlaylistTracks(DEFAULT_PLAYLIST_ID));
      }
    } else {
      // Si l'utilisateur n'est pas connecté, afficher la modal de connexion
      setShowLoginModal(true);
    }
  };

  const handleVoteDown = (trackId: string) => {
    console.log('Vote down for track:', trackId);
    // Dans notre implémentation, nous utilisons le même système pour les votes positifs et négatifs
    handleVoteUp(trackId);
  };

  const handleAddYouTubeTrack = async (youtubeUrl: string) => {
    console.log('Adding YouTube track:', youtubeUrl);
    setIsAddingTrack(true);
    
    try {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      
      // Extraire l'ID YouTube de l'URL
      const videoId = extractYouTubeId(youtubeUrl);
      
      if (!videoId) {
        console.error('URL YouTube invalide');
        alert('URL YouTube invalide. Veuillez entrer une URL valide.');
        return;
      }
      
      // Récupérer les informations de la vidéo
      const videoInfo = await getYouTubeVideoInfo(videoId);
      
      if (!videoInfo) {
        console.error('Impossible de récupérer les informations de la vidéo');
        alert('Impossible de récupérer les informations de la vidéo. Veuillez réessayer.');
        return;
      }
      
      // Ajouter la piste YouTube à la playlist
      const newTrack = addYouTubeTrack(
        DEFAULT_PLAYLIST_ID,
        videoInfo.title,
        videoInfo.artist,
        videoInfo.thumbnailUrl,
        videoInfo.duration,
        `https://www.youtube.com/watch?v=${videoId}`,
        currentUser.id,
        currentUser.username
      );
      
      // Mettre à jour les pistes
      setTracks(getPlaylistTracks(DEFAULT_PLAYLIST_ID));
      
      // Si c'est la première piste et qu'aucune n'est en cours de lecture, la sélectionner
      if (!currentTrackId) {
        setCurrentTrackId(newTrack.id);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la piste YouTube:", error);
      alert("Une erreur est survenue lors de l&apos;ajout de la piste. Veuillez réessayer.");
    } finally {
      setIsAddingTrack(false);
    }
  };

  const handleAddUploadTrack = (file: File) => {
    console.log('Adding upload track:', file.name);
    setIsAddingTrack(true);
    
    try {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      
      // Sauvegarder le fichier audio
      const audioFile = saveAudioFile(file, currentUser.id);
      
      // Extraire le nom du fichier sans l'extension
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      
      // Séparer le titre et l'artiste si le nom du fichier est au format "Artiste - Titre"
      let title = fileName;
      let artist = 'Local Upload';
      
      const match = fileName.match(/(.+)\s+-\s+(.+)/);
      if (match) {
        artist = match[1].trim();
        title = match[2].trim();
      }
      
      // Ajouter la piste uploadée à la playlist
      const newTrack = addUploadTrack(
        DEFAULT_PLAYLIST_ID,
        title,
        artist,
        audioFile.id,
        currentUser.id,
        currentUser.username
      );
      
      if (newTrack) {
        // Mettre à jour les pistes
        setTracks(getPlaylistTracks(DEFAULT_PLAYLIST_ID));
        
        // Si c'est la première piste et qu'aucune n'est en cours de lecture, la sélectionner
        if (!currentTrackId) {
          setCurrentTrackId(newTrack.id);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l&apos;ajout du fichier audio:", error);
      alert("Une erreur est survenue lors de l&apos;ajout du fichier audio. Veuillez réessayer.");
    } finally {
      setIsAddingTrack(false);
    }
  };

  const handlePlayerReady = () => {
    console.log('Player is ready');
    setPlayerReady(true);
  };

  const handlePlayerStateChange = (state: 'playing' | 'paused' | 'ended') => {
    console.log('Player state changed to:', state);
    setPlayerState(state);
    
    // Synchroniser l'état de lecture
    if (state === 'playing' && !isPlaying) {
      setIsPlaying(true);
    } else if (state === 'paused' && isPlaying) {
      setIsPlaying(false);
    }
  };

  const handlePlayerProgress = (progress: number) => {
    setPlayerProgress(progress);
  };


  // Gérer l'inscription d'un utilisateur
  const handleRegister = async (data: { username: string; email: string; password: string; confirmPassword: string }) => {
    try {
      const user = await registerUser(data);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      
      // Ajouter l'utilisateur à la liste des utilisateurs en ligne
      setOnlineUsers(prev => [...prev, user]);
    } catch (error) {
      console.error("Erreur d&apos;inscription:", error);
      alert("Erreur lors de l&apos;inscription. Veuillez réessayer.");
    }
  };

  // Gérer la déconnexion d'un utilisateur
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Retirer l'utilisateur de la liste des utilisateurs en ligne
    if (currentUser) {
      setOnlineUsers(prev => prev.filter(user => user.id !== currentUser.id));
    }
    
    // Afficher la modal de connexion
    setShowLoginModal(true);
  };

  return (
    <main>
      <Header 
        roomName={roomName} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <div className="jz-content">
        <div className="jz-queue">
          <AddTrackForm 
            onAddYouTubeTrack={handleAddYouTubeTrack}
            onAddUploadTrack={handleAddUploadTrack}
            isSubmitting={isAddingTrack}
            isAuthenticated={isAuthenticated}
            onLoginRequired={() => setShowLoginModal(true)}
          />
          <TrackQueue 
            tracks={tracks}
            currentTrackId={currentTrackId}
            onTrackSelect={handleTrackSelect}
            onVoteUp={handleVoteUp}
            onVoteDown={handleVoteDown}
            currentUserId={currentUser?.id}
          />
        </div>
        
        <div className="jz-player-area">
          {!playerReady && currentTrack && currentTrack.source === 'youtube' && (
            <div className="text-center py-3">
              <p>Chargement du lecteur YouTube...</p>
            </div>
          )}
          <Player 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onVoteUp={() => currentTrack && handleVoteUp(currentTrack.id)}
            onVoteDown={() => currentTrack && handleVoteDown(currentTrack.id)}
            onReady={handlePlayerReady}
            onStateChange={handlePlayerStateChange}
            onProgress={handlePlayerProgress}
            progress={playerProgress}
          />
        </div>
        
        <div className="jz-users-chat">
          <UsersChat 
            currentUser={currentUser}
            onlineUsers={onlineUsers}
          />
        </div>
      </div>
      
      {/* Modal de connexion/inscription */}
      {showLoginModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">Connexion / Inscription</h5>
              </div>
              <div className="modal-body">
                <p>Veuillez vous connecter ou vous inscrire pour continuer.</p>
                {/* Formulaire de connexion/inscription à implémenter */}
                <div className="d-flex justify-content-end">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      // Pour la démo, connecter automatiquement en tant qu'invité
                      handleRegister({
                        username: `Invité_${Math.floor(Math.random() * 1000)}`,
                        email: `invite${Math.floor(Math.random() * 1000)}@example.com`,
                        password: 'password123',
                        confirmPassword: 'password123'
                      });
                    }}
                  >
                    Continuer en tant qu invité
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
