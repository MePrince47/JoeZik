import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Button } from 'react-bootstrap';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import YouTubePlayer from './YouTubePlayer';
import AudioPlayer from './AudioPlayer';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number;
  source: 'youtube' | 'upload';
  sourceUrl: string;
  addedBy: string;
}

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVoteUp: () => void;
  onVoteDown: () => void;
  onReady?: () => void;
  onStateChange?: (state: 'playing' | 'paused' | 'ended') => void;
  onProgress?: (progress: number) => void;
  progress?: number;
}

const Player: React.FC<PlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onVoteUp,
  onVoteDown,
  onReady,
  onStateChange,
  onProgress,
  progress: externalProgress
}) => {
  const [volume, setVolume] = useState(80);
  const [internalProgress, setInternalProgress] = useState(0);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  // Utiliser le progress externe s'il est fourni, sinon utiliser l'interne
  const progress = externalProgress !== undefined ? externalProgress : internalProgress;

  // Extraire l'ID YouTube de l'URL
  useEffect(() => {
    if (currentTrack && currentTrack.source === 'youtube') {
      const videoId = extractYouTubeId(currentTrack.sourceUrl);
      setYoutubeVideoId(videoId);
      setPlayerReady(false); // Réinitialiser l'état prêt quand on change de piste
      setPlayerError(false); // Réinitialiser l'état d'erreur
    } else {
      setYoutubeVideoId(null);
    }
  }, [currentTrack]);

  // Fonction pour extraire l'ID YouTube d'une URL
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Gérer le changement d'état du lecteur
  const handlePlayerStateChange = (state: 'playing' | 'paused' | 'ended') => {
    console.log(`Player state changed to: ${state}`);
    if (onStateChange) {
      onStateChange(state);
    }
  };

  // Gérer la progression du lecteur
  const handlePlayerProgress = (newProgress: number) => {
    setInternalProgress(newProgress);
    if (onProgress) {
      onProgress(newProgress);
    }
  };

  // Gérer quand le lecteur est prêt
  const handlePlayerReady = () => {
    console.log('Player is ready');
    setPlayerReady(true);
    if (onReady) {
      onReady();
    }
  };

  // Gérer les erreurs du lecteur
  const handlePlayerError = () => {
    console.error('Player error occurred');
    setPlayerError(true);
    if (onStateChange) {
      onStateChange('paused');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center p-3">
      {currentTrack ? (
        <>
          <Card className="bg-darker border-0 mb-3" style={{ maxWidth: '400px' }}>
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

          {/* Message d'erreur */}
          {playerError && (
            <div className="text-center mb-3 text-danger">
              <p>Erreur lors du chargement du média. Veuillez réessayer.</p>
            </div>
          )}

          {/* Lecteur YouTube caché */}
          {currentTrack.source === 'youtube' && youtubeVideoId && (
            <div style={{ display: 'none' }}>
              <YouTubePlayer
                videoId={youtubeVideoId}
                isPlaying={isPlaying}
                onStateChange={handlePlayerStateChange}
                onProgress={handlePlayerProgress}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                volume={volume}
              />
            </div>
          )}

          {/* Lecteur Audio caché pour les fichiers uploadés */}
          {currentTrack.source === 'upload' && (
            <div style={{ display: 'none' }}>
              <AudioPlayer
                audioUrl={currentTrack.sourceUrl}
                isPlaying={isPlaying}
                onStateChange={handlePlayerStateChange}
                onProgress={handlePlayerProgress}
                onReady={handlePlayerReady}
                onError={handlePlayerError}
                volume={volume}
              />
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center w-100 mb-2">
            <span className="small">{formatTime(progress * currentTrack.duration)}</span>
            <ProgressBar 
              now={progress * 100} 
              className="flex-grow-1 mx-2" 
              style={{ height: '8px' }}
            />
            <span className="small">{formatTime(currentTrack.duration)}</span>
          </div>

          <div className="d-flex justify-content-center align-items-center mb-3">
            <Button 
              variant="link" 
              className="text-light" 
              onClick={onPrevious}
              disabled={!playerReady}
            >
              <FaStepBackward />
            </Button>
            <Button 
              variant="primary" 
              className="rounded-circle mx-3 d-flex justify-content-center align-items-center" 
              style={{ width: '50px', height: '50px' }}
              onClick={onPlayPause}
              disabled={!playerReady || playerError}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
            <Button 
              variant="link" 
              className="text-light" 
              onClick={onNext}
              disabled={!playerReady}
            >
              <FaStepForward />
            </Button>
          </div>

          <div className="d-flex justify-content-between align-items-center w-100">
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
            <div>
              <Button 
                variant="outline-success" 
                className="me-2" 
                onClick={onVoteUp}
              >
                <FaThumbsUp />
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={onVoteDown}
              >
                <FaThumbsDown />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <h4>Aucun morceau en cours de lecture</h4>
          <p className="text-muted">Ajoutez un morceau à la file d&apos;attente pour commencer</p>
        </div>
      )}
    </div>
  );
};

export default Player;
