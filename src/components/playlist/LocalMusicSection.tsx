import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp } from 'react-icons/fa';
import LocalAudioPlayer from '@/components/player/LocalAudioPlayer';
import LocalTrackList from '@/components/playlist/LocalTrackList';
import { Track } from '@/lib/playlist/trackService';

interface LocalMusicSectionProps {
  tracks: Track[];
  currentUser: { id: string; username: string } | null;
  onDeleteTrack?: (trackId: string) => void;
}

const LocalMusicSection: React.FC<LocalMusicSectionProps> = ({
  tracks,
  currentUser,
  onDeleteTrack
}) => {
  // États
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerState, setPlayerState] = useState<'playing' | 'paused' | 'ended'>('paused');
  const [playerProgress, setPlayerProgress] = useState(0);
  const [volume, setVolume] = useState(80);

  // Filtrer uniquement les pistes locales (upload)
  const localTracks = tracks.filter(track => track.source === 'upload' && track.isLocalOnly);

  // Obtenir la piste actuelle
  const currentTrack = localTracks.find(track => track.id === currentTrackId) || null;

  // Effet pour sélectionner la première piste si aucune n'est sélectionnée
  useEffect(() => {
    if (!currentTrackId && localTracks.length > 0) {
      setCurrentTrackId(localTracks[0].id);
    }
  }, [localTracks, currentTrackId]);

  // Effet pour gérer la fin d'une piste
  useEffect(() => {
    if (playerState === 'ended') {
      handleNext();
    }
  }, [playerState]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handlers
  const handlePlayPause = () => {
    console.log('Play/Pause clicked, current state:', isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentTrackId) return;
    
    console.log('Next track clicked');
    const currentIndex = localTracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex < localTracks.length - 1) {
      setCurrentTrackId(localTracks[currentIndex + 1].id);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (!currentTrackId) return;
    
    console.log('Previous track clicked');
    const currentIndex = localTracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex > 0) {
      setCurrentTrackId(localTracks[currentIndex - 1].id);
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    console.log('Track selected:', trackId);
    setCurrentTrackId(trackId);
    setIsPlaying(true);
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

  const handlePlayerError = () => {
    console.error('Player error occurred');
    setIsPlaying(false);
  };

  return (
    <div className="local-music-section">
      <div className="local-player-container mb-4">
        {currentTrack ? (
          <>
            <Card className="bg-darker border-0 mb-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <Card.Img 
                variant="top" 
                src={currentTrack.coverUrl} 
                alt={`${currentTrack.title} cover`}
                style={{ height: '250px', objectFit: 'cover' }}
              />
              <Card.Body className="text-center">
                <Card.Title className="mb-0 fs-5">{currentTrack.title}</Card.Title>
                <Card.Text className="text-muted">{currentTrack.artist}</Card.Text>
                <Card.Text className="small text-muted">Ajouté par {currentTrack.addedBy}</Card.Text>
              </Card.Body>
            </Card>

            {/* Message de chargement */}
            {!playerReady && (
              <div className="text-center mb-3">
                <p className="text-muted">Chargement du lecteur...</p>
              </div>
            )}

            {/* Lecteur audio local caché */}
            <div style={{ display: 'none' }}>
              <LocalAudioPlayer
                audioUrl={currentTrack.sourceUrl}
                isPlaying={isPlaying}
                onStateChange={handlePlayerStateChange}
                onProgress={handlePlayerProgress}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                volume={volume}
                showVisualizer={false}
              />
            </div>

            {/* Visualiseur audio */}
            <div className="visualizer-container mb-3">
              <LocalAudioPlayer
                audioUrl={currentTrack.sourceUrl}
                isPlaying={isPlaying}
                onStateChange={() => {}}
                onProgress={() => {}}
                onReady={() => {}}
                volume={volume}
                showVisualizer={true}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center w-100 mb-2">
              <span className="small">{formatTime(playerProgress * currentTrack.duration)}</span>
              <ProgressBar 
                now={playerProgress * 100} 
                className="flex-grow-1 mx-2" 
                style={{ height: '8px' }}
              />
              <span className="small">{formatTime(currentTrack.duration)}</span>
            </div>

            <div className="d-flex justify-content-center align-items-center mb-3">
              <Button 
                variant="link" 
                className="text-light" 
                onClick={handlePrevious}
                disabled={!playerReady}
              >
                <FaStepBackward />
              </Button>
              <Button 
                variant="primary" 
                className="rounded-circle mx-3 d-flex justify-content-center align-items-center" 
                style={{ width: '50px', height: '50px' }}
                onClick={handlePlayPause}
                disabled={!playerReady}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </Button>
              <Button 
                variant="link" 
                className="text-light" 
                onClick={handleNext}
                disabled={!playerReady}
              >
                <FaStepForward />
              </Button>
            </div>

            <div className="d-flex justify-content-center align-items-center w-100">
              <div className="d-flex align-items-center">
                <FaVolumeUp className="me-2" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(parseInt(e.target.value))} 
                  className="form-range" 
                  style={{ width: '100px' }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <h4>Aucun morceau local en cours de lecture</h4>
            <p className="text-muted">Ajoutez un morceau local pour commencer</p>
          </div>
        )}
      </div>

      <div className="local-tracks-container">
        <LocalTrackList 
          tracks={localTracks}
          currentTrackId={currentTrackId}
          onTrackSelect={handleTrackSelect}
          onDeleteTrack={onDeleteTrack}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
};

export default LocalMusicSection;
