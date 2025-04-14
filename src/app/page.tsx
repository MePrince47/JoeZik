'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Player from '@/components/player/Player';
import TrackQueue from '@/components/playlist/TrackQueue';
import UsersChat from '@/components/realtime/UsersChat';
import AddTrackForm from '@/components/playlist/AddTrackForm';
import AuthForm from '@/components/auth/AuthForm';
// Types
import { UserProfile } from '@/types/user';
import { Track } from '@/lib/playlist/trackService';
// Styles
import '@/styles/custom/home.scss';

// Adaptateur de stockage
import { 
  getAuthService, 
  getTrackService, 
  getFileService, 
  getChatService 
} from '@/lib/storage/storageAdapter';

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
const DEFAULT_PLAYLIST_ID = '2cec40e4-8bdd-40a5-b258-70d530655fa4';

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
  const [sortCriteria, setSortCriteria] = useState<'votes' | 'date'>('votes');
  
  // Services
  const [authService, setAuthService] = useState<any>(null);
  const [trackService, setTrackService] = useState<any>(null);
  const [fileService, setFileService] = useState<any>(null);
  const [chatService, setChatService] = useState<any>(null);

  // Charger les services
  useEffect(() => {
    const loadServices = async () => {
      const auth = await getAuthService();
      const track = await getTrackService();
      const file = await getFileService();
      const chat = await getChatService();
      
      setAuthService(auth);
      setTrackService(track);
      setFileService(file);
      setChatService(chat);
    };
    
    loadServices();
  }, []);

  // Fonction pour charger les pistes
  const loadTracks = async () => {
    if (!trackService) return;
    
    try {
      // Charger les pistes de la playlist par défaut avec le critère de tri
      const playlistTracks = await trackService.getPlaylistTracks(DEFAULT_PLAYLIST_ID, sortCriteria);
      setTracks(playlistTracks);
      
      // Si aucune piste n'est sélectionnée et qu'il y a des pistes disponibles, sélectionner la première
      if (!currentTrackId && playlistTracks.length > 0) {
        setCurrentTrackId(playlistTracks[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pistes:', error);
    }
  };

  // Charger l'utilisateur actuel et les pistes au chargement de la page
  useEffect(() => {
    if (!authService || !trackService) return;
    
    const loadUserData = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // Simuler des utilisateurs en ligne (dans une vraie application, cela viendrait d'un service de présence)
          setOnlineUsers([user]);
        } else {
          // Si aucun utilisateur n'est connecté, afficher la modal de connexion
          setShowLoginModal(true);
        }
        
        // Charger les pistes
        await loadTracks();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadUserData();
  }, [authService, trackService]);
  
  // Effet pour actualiser les pistes lorsque le critère de tri change
  useEffect(() => {
    if (trackService) {
      loadTracks();
    }
  }, [sortCriteria, trackService]);
  
  // Effet pour actualiser périodiquement les pistes (polling)
  useEffect(() => {
    if (!trackService) return;
    
    // Actualiser les pistes toutes les 10 secondes
    const interval = setInterval(() => {
      loadTracks();
    }, 10000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(interval);
  }, [trackService, sortCriteria]);

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

  const handleVoteUp = async (trackId: string) => {
    if (!trackService) return;
    
    console.log('Vote up for track:', trackId);
    if (currentUser) {
      try {
        const result = await trackService.voteForTrack(trackId, currentUser.id);
        if (result.success) {
          // Mettre à jour les pistes après le vote
          const updatedTracks = await trackService.getPlaylistTracks(DEFAULT_PLAYLIST_ID);
          setTracks(updatedTracks);
        }
      } catch (error) {
        console.error('Erreur lors du vote:', error);
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

  const handleDeleteTrack = async (trackId: string) => {
    if (!trackService) return;
    
    console.log('Deleting track:', trackId);
    try {
      const success = await trackService.deleteTrack(trackId);
      if (success) {
        // Mettre à jour les pistes après la suppression
        const updatedTracks = await trackService.getPlaylistTracks(DEFAULT_PLAYLIST_ID);
        setTracks(updatedTracks);
        
        // Si la piste supprimée était en cours de lecture, passer à la suivante
        if (currentTrackId === trackId) {
          const nextTrack = updatedTracks[0] || null;
          setCurrentTrackId(nextTrack ? nextTrack.id : null);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la piste:', error);
      alert('Une erreur est survenue lors de la suppression de la piste. Veuillez réessayer.');
    }
  };

  const handleAddYouTubeTrack = async (youtubeUrl: string) => {
    if (!trackService) return;
    
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
      const newTrack = await trackService.addYouTubeTrack(
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
      const updatedTracks = await trackService.getPlaylistTracks(DEFAULT_PLAYLIST_ID);
      setTracks(updatedTracks);
      
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

  // La fonction handleAddUploadTrack a été supprimée car l'upload local n'est plus supporté

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


  // Gérer la connexion d'un utilisateur
  const handleLogin = async (credentials: { email: string; password: string }) => {
    if (!authService) return;
    
    try {
      const user = await authService.loginUser(credentials);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      
      // Ajouter l'utilisateur à la liste des utilisateurs en ligne
      setOnlineUsers(prev => [...prev, user]);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw new Error("Erreur lors de la connexion. Veuillez vérifier vos identifiants.");
    }
  };

  // Gérer l'inscription d'un utilisateur
  const handleRegister = async (data: { username: string; email: string; password: string; confirmPassword: string }) => {
    if (!authService) return;
    
    try {
      const user = await authService.registerUser(data);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      
      // Ajouter l'utilisateur à la liste des utilisateurs en ligne
      setOnlineUsers(prev => [...prev, user]);
    } catch (error) {
      console.error("Erreur d&apos;inscription:", error);
      throw new Error("Erreur lors de l&apos;inscription. Veuillez réessayer.");
    }
  };

  // Gérer la connexion en tant qu'invité
  const handleContinueAsGuest = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    handleRegister({
      username: `Invité_${randomNum}`,
      email: `invite${randomNum}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    });
  };

  // Gérer la déconnexion d'un utilisateur
  const handleLogout = async () => {
    if (!authService) return;
    
    authService.logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Retirer l'utilisateur de la liste des utilisateurs en ligne
    if (currentUser) {
      setOnlineUsers(prev => prev.filter(user => user.id !== currentUser.id));
    }
    
    // Afficher la modal de connexion
    setShowLoginModal(true);
  };

  // Si les services ne sont pas encore chargés, afficher un message de chargement
  if (!authService || !trackService || !fileService || !chatService) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="jz-app">
      <div className="jz-header-modern">
        <Header 
          roomName={roomName} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>
      
      <div className="jz-content-modern">
        <div className="jz-queue-modern">
          <div className="queue-header d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">File d&apos;attente</h5>
              <span className="badge">{tracks.length}</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="btn-group btn-group-sm" role="group" aria-label="Tri des pistes">
                <button 
                  type="button" 
                  className={`btn ${sortCriteria === 'votes' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSortCriteria('votes')}
                >
                  Par likes
                </button>
                <button 
                  type="button" 
                  className={`btn ${sortCriteria === 'date' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSortCriteria('date')}
                >
                  Plus récent
                </button>
              </div>
            </div>
          </div>
          
          <div className="add-track-container">
            <AddTrackForm 
              onAddYouTubeTrack={handleAddYouTubeTrack}
              isSubmitting={isAddingTrack}
              isAuthenticated={isAuthenticated}
              onLoginRequired={() => setShowLoginModal(true)}
            />
          </div>
          
          <div className="tracks-container">
            <TrackQueue 
              tracks={tracks}
              currentTrackId={currentTrackId}
              onTrackSelect={handleTrackSelect}
              onVoteUp={handleVoteUp}
              onVoteDown={handleVoteDown}
              onDeleteTrack={handleDeleteTrack}
              currentUserId={currentUser?.id}
            />
          </div>
        </div>
        
        <div className="jz-player-area-modern">
          <div className="player-container">
            {!playerReady && currentTrack && currentTrack.source === 'youtube' && (
              <div className="loading-indicator text-center py-3">
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
        </div>
        
        <div className="jz-users-chat-modern">
          <UsersChat 
            currentUser={currentUser}
            onlineUsers={onlineUsers}
          />
        </div>
      </div>
      
      {/* Modal de connexion/inscription */}
      {showLoginModal && (
        <div className="modal show d-block auth-modal" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bienvenue sur JoeZik</h5>
              </div>
              <div className="modal-body">
                <p className="text-center mb-4">Connectez-vous pour profiter de toutes les fonctionnalités et partager votre musique avec la communauté.</p>
                <AuthForm 
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onContinueAsGuest={handleContinueAsGuest}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
