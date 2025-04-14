import React, { useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onStateChange: (state: 'playing' | 'paused' | 'ended') => void;
  onProgress: (progress: number) => void;
  onReady: () => void;
  onError?: () => void;
  volume: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  isPlaying,
  onStateChange,
  onProgress,
  onReady,
  onError,
  volume
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convertir le chemin relatif en URL complète
  const getFullAudioUrl = useCallback((url: string) => {
    // Si l'URL commence par http:// ou https://, c'est déjà une URL complète
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si l'URL commence par /, c'est un chemin relatif à la racine du site
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // Sinon, c'est un chemin relatif au répertoire courant
    return `${window.location.origin}/${url}`;
  }, []);

  // Initialiser le lecteur audio
  useEffect(() => {
    if (!audioRef.current) {
      try {
        const fullUrl = getFullAudioUrl(audioUrl);
        console.log('Loading audio from URL:', fullUrl);
        
        const audio = new Audio(fullUrl);
        audioRef.current = audio;
        
        // Événements audio
        audio.addEventListener('canplaythrough', () => {
          console.log('Audio ready to play');
          onReady();
        });
        
        audio.addEventListener('play', () => {
          console.log('Audio playing');
          onStateChange('playing');
        });
        
        audio.addEventListener('pause', () => {
          console.log('Audio paused');
          onStateChange('paused');
        });
        
        audio.addEventListener('ended', () => {
          console.log('Audio ended');
          onStateChange('ended');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio error occurred:', e);
          console.error('Audio URL was:', fullUrl);
          onStateChange('paused');
          if (onError) {
            onError();
          }
        });
        
        // Charger l'audio
        audio.load();
      } catch (error) {
        console.error('Error initializing audio player:', error);
        if (onError) {
          onError();
        }
      }
    }
    
    return () => {
      // Nettoyage
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
        audioRef.current = null;
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [audioUrl, onReady, onStateChange]);

  // Gérer les changements d'URL audio
  useEffect(() => {
    if (audioRef.current) {
      try {
        const fullUrl = getFullAudioUrl(audioUrl);
        if (audioRef.current.src !== fullUrl) {
          console.log('Loading new audio:', fullUrl);
          audioRef.current.src = fullUrl;
          audioRef.current.load();
          if (isPlaying) {
            audioRef.current.play().catch(error => {
              console.error('Error playing audio:', error);
              if (onError) {
                onError();
              }
            });
          }
        }
      } catch (error) {
        console.error('Error updating audio source:', error);
        if (onError) {
          onError();
        }
      }
    }
  }, [audioUrl, isPlaying, getFullAudioUrl]);

  // Gérer les changements de lecture/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log('Playing audio');
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          if (onError) {
            onError();
          }
        });
        
        // Suivre la progression
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const progress = audioRef.current.currentTime / audioRef.current.duration;
            onProgress(progress);
          }
        }, 1000);
      } else {
        console.log('Pausing audio');
        audioRef.current.pause();
        
        // Arrêter le suivi de progression
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }
  }, [isPlaying, onProgress]);

  // Gérer les changements de volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return null; // Ce composant ne rend rien visuellement
};

export default AudioPlayer;
