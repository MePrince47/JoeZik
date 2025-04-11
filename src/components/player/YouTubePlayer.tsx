import React, { useEffect, useRef, useState } from 'react';

// Interfaces pour l'API YouTube
interface YouTubePlayerEvent {
  target: YouTubePlayerInstance;
  data?: number;
}

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YouTubePlayerOptions {
  height: string | number;
  width: string | number;
  videoId: string;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    disablekb?: number;
    fs?: number;
    modestbranding?: number;
    rel?: number;
    [key: string]: unknown;
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
    [key: string]: ((event: YouTubePlayerEvent) => void) | undefined;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        options: YouTubePlayerOptions
      ) => YouTubePlayerInstance;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
        UNSTARTED: number;
      };
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onStateChange: (state: 'playing' | 'paused' | 'ended') => void;
  onProgress: (progress: number) => void;
  onReady: () => void;
  onError?: () => void;
  volume: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  isPlaying,
  onStateChange,
  onProgress,
  onReady,
  onError,
  volume
}) => {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayerInstance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  // Fonction pour initialiser le lecteur YouTube
  const initializePlayer = () => {
    console.log('Initializing YouTube player with video ID:', videoId);
    
    if (!containerRef.current) {
      console.error('Container ref is not available');
      return;
    }
    
    try {
      playerInstanceRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            console.log('YouTube player ready');
            playerRef.current = event.target;
            playerRef.current.setVolume(volume);
            onReady();
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            if (event.data !== undefined) {
              handleStateChange(event.data);
            }
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error('YouTube player error:', event.data);
            // Informer l'utilisateur de l'erreur
            onStateChange('paused');
            if (onError) {
              onError();
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setApiError(true);
    }
  };

  // Load YouTube API
  useEffect(() => {
    console.log('Loading YouTube API for video ID:', videoId);
    
    // Vérifier si l'API est déjà chargée
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already loaded');
      setApiLoaded(true);
      initializePlayer();
      return;
    }
    
    // Fonction de rappel lorsque l'API est chargée
    const onYouTubeIframeAPIReady = () => {
      console.log('YouTube API loaded');
      setApiLoaded(true);
      initializePlayer();
    };
    
    // Sauvegarder la fonction existante si elle existe
    const existingCallback = window.onYouTubeIframeAPIReady;
    
    // Définir notre fonction de rappel
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) {
        existingCallback();
      }
      onYouTubeIframeAPIReady();
    };
    
    // Charger l'API YouTube si elle n'est pas déjà chargée
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Ajouter un gestionnaire d'erreur
      tag.onerror = () => {
        console.error('Failed to load YouTube API');
        setApiError(true);
      };
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    // Définir un délai d'attente pour le chargement de l'API
    const timeoutId = setTimeout(() => {
      if (!apiLoaded && !apiError) {
        console.error('YouTube API load timeout');
        setApiError(true);
      }
    }, 10000); // 10 secondes de délai d'attente
    
    return () => {
      // Clean up
      clearTimeout(timeoutId);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoId]); // Dépend de videoId pour recréer le lecteur si l'ID change

  // Handle video ID changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      try {
        console.log('Loading new video ID:', videoId);
        playerRef.current.loadVideoById(videoId);
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Error changing video ID:', error);
      }
    }
  }, [videoId, isPlaying]);

  // Handle play/pause changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        console.log('Play state changed:', isPlaying);
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error('Error changing play state:', error);
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch (error) {
        console.error('Error changing volume:', error);
      }
    }
  }, [volume]);

  // Handle player state changes
  const handleStateChange = (state: number) => {
    try {
      if (state === window.YT.PlayerState.PLAYING) {
        console.log('YouTube player state: PLAYING');
        onStateChange('playing');
        
        // Start progress tracking
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          if (playerRef.current) {
            try {
              const currentTime = playerRef.current.getCurrentTime();
              const duration = playerRef.current.getDuration();
              const progress = currentTime / duration;
              onProgress(progress);
            } catch (error) {
              console.error('Error tracking progress:', error);
            }
          }
        }, 1000);
      } else if (state === window.YT.PlayerState.PAUSED) {
        console.log('YouTube player state: PAUSED');
        onStateChange('paused');
        
        // Stop progress tracking
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else if (state === window.YT.PlayerState.ENDED) {
        console.log('YouTube player state: ENDED');
        onStateChange('ended');
        
        // Stop progress tracking
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error handling state change:', error);
    }
  };

  // Afficher un message d'erreur si l'API ne se charge pas
  if (apiError) {
    return (
      <div>
        <div ref={containerRef} id="youtube-player" />
        <div style={{ display: 'none' }}>
          Erreur de chargement du lecteur YouTube. Veuillez réessayer.
        </div>
      </div>
    );
  }

  return <div ref={containerRef} id="youtube-player" />;
};

export default YouTubePlayer;
