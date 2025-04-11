import React, { useEffect, useRef } from 'react';

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

  // Initialiser le lecteur audio
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
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
      
      audio.addEventListener('error', () => {
        console.error('Audio error occurred');
        onStateChange('paused');
        if (onError) {
          onError();
        }
      });
      
      // Charger l'audio
      audio.load();
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
    if (audioRef.current && audioRef.current.src !== audioUrl) {
      console.log('Loading new audio:', audioUrl);
      audioRef.current.src = audioUrl;
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
  }, [audioUrl, isPlaying]);

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
