import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface LocalAudioPlayerRef {
  seekTo: (position: number) => void;
  skipForward: (seconds: number) => void;
  skipBackward: (seconds: number) => void;
  getDuration: () => number;
}

interface LocalAudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onStateChange: (state: 'playing' | 'paused' | 'ended') => void;
  onProgress: (progress: number) => void;
  onReady: () => void;
  onError?: () => void;
  volume: number;
  showVisualizer?: boolean;
  onSeek?: (position: number) => void;
}

const LocalAudioPlayer = forwardRef<LocalAudioPlayerRef, LocalAudioPlayerProps>(function LocalAudioPlayer(props, ref) {
  const {
    audioUrl,
    isPlaying,
    onStateChange,
    onProgress,
    onReady,
    onError,
    volume,
    showVisualizer = true,
    onSeek
  } = props;
  
  // Références pour l'API Web Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // États
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadRetries, setLoadRetries] = useState(0);
  const MAX_RETRIES = 3;

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

  // Initialiser le contexte audio et les nœuds
  const initAudioContext = useCallback(() => {
    if (!audioElementRef.current) return;
    
    try {
      // Créer le contexte audio s'il n'existe pas
      if (!audioContextRef.current) {
        // Utiliser une assertion de type plus précise pour webkitAudioContext
        audioContextRef.current = new (window.AudioContext || 
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      // Créer l'analyseur pour la visualisation
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
      
      // Créer le nœud de gain pour le contrôle du volume
      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain();
      }
      
      // Créer le nœud source à partir de l'élément audio
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
        
        // Connecter les nœuds
        sourceNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
      
      // Mettre à jour le volume
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volume / 100;
      }
      
      // Démarrer la visualisation si demandé
      if (showVisualizer) {
        startVisualizer();
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
      if (onError) {
        onError();
      }
    }
  }, [volume, showVisualizer, onError]);

  // Fonction pour dessiner la visualisation
  const drawVisualizer = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajuster la taille du canvas si nécessaire
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    
    // Créer un tableau pour les données de fréquence
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Obtenir les données de fréquence
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les barres de fréquence
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      // Créer un dégradé de couleur basé sur la fréquence
      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    // Continuer l'animation
    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  // Démarrer la visualisation
  const startVisualizer = useCallback(() => {
    if (!showVisualizer) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [showVisualizer, drawVisualizer]);

  // Arrêter la visualisation
  const stopVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Initialiser le lecteur audio
  useEffect(() => {
    if (!audioElementRef.current) {
      try {
        const fullUrl = getFullAudioUrl(audioUrl);
        console.log('Loading local audio from URL:', fullUrl);
        
        // Créer l'élément audio
        const audio = new Audio(fullUrl);
        audioElementRef.current = audio;
        
        // Configurer les événements
        audio.addEventListener('canplaythrough', () => {
          console.log('Audio ready to play');
          setIsLoaded(true);
          setIsBuffering(false);
          setLoadRetries(0);
          
          // Initialiser le contexte audio
          initAudioContext();
          
          // Notifier que le lecteur est prêt
          onReady();
          
          // Démarrer la lecture si nécessaire
          if (isPlaying) {
            audio.play().catch(error => {
              console.error('Error playing audio:', error);
              if (onError) {
                onError();
              }
            });
          }
        });
        
        audio.addEventListener('waiting', () => {
          console.log('Audio buffering');
          setIsBuffering(true);
        });
        
        audio.addEventListener('playing', () => {
          console.log('Audio playing');
          setIsBuffering(false);
          onStateChange('playing');
          
          // Démarrer la visualisation
          if (showVisualizer) {
            startVisualizer();
          }
        });
        
        audio.addEventListener('pause', () => {
          console.log('Audio paused');
          onStateChange('paused');
          
          // Arrêter la visualisation
          stopVisualizer();
        });
        
        audio.addEventListener('ended', () => {
          console.log('Audio ended');
          onStateChange('ended');
          
          // Arrêter la visualisation
          stopVisualizer();
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio error occurred:', e);
          console.error('Audio URL was:', fullUrl);
          
          // Tenter de recharger l'audio en cas d'erreur
          if (loadRetries < MAX_RETRIES) {
            console.log(`Retrying audio load (${loadRetries + 1}/${MAX_RETRIES})...`);
            setLoadRetries(prev => prev + 1);
            
            // Attendre un peu avant de réessayer
            setTimeout(() => {
              if (audioElementRef.current) {
                audioElementRef.current.load();
              }
            }, 1000);
          } else {
            console.error('Max retries reached, giving up');
            setIsBuffering(false);
            onStateChange('paused');
            if (onError) {
              onError();
            }
          }
        });
        
        // Charger l'audio
        audio.load();
        
        // Suivre la progression
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          if (audioElementRef.current && audioElementRef.current.duration) {
            const progress = audioElementRef.current.currentTime / audioElementRef.current.duration;
            onProgress(progress);
          }
        }, 250); // Mise à jour plus fréquente pour une meilleure fluidité
      } catch (error) {
        console.error('Error initializing audio player:', error);
        if (onError) {
          onError();
        }
      }
    }
    
    return () => {
      // Nettoyage
      stopVisualizer();
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current.remove();
        audioElementRef.current = null;
      }
      
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
        } catch (e) {
          console.error('Error disconnecting source node:', e);
        }
      }
      
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        } catch (e) {
          console.error('Error disconnecting gain node:', e);
        }
      }
      
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        } catch (e) {
          console.error('Error disconnecting analyser node:', e);
        }
      }
      
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (e) {
          console.error('Error closing audio context:', e);
        }
      }
    };
  }, [audioUrl, getFullAudioUrl, initAudioContext, isPlaying, onReady, onStateChange, onProgress, onError, loadRetries, showVisualizer, startVisualizer, stopVisualizer]);

  // Gérer les changements d'URL audio
  useEffect(() => {
    if (audioElementRef.current) {
      try {
        const fullUrl = getFullAudioUrl(audioUrl);
        if (audioElementRef.current.src !== fullUrl) {
          console.log('Loading new audio:', fullUrl);
          audioElementRef.current.src = fullUrl;
          audioElementRef.current.load();
          setIsLoaded(false);
          
          if (isPlaying) {
            audioElementRef.current.play().catch(error => {
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
  }, [audioUrl, isPlaying, getFullAudioUrl, onError]);

  // Gérer les changements de lecture/pause
  useEffect(() => {
    if (audioElementRef.current && isLoaded) {
      if (isPlaying) {
        console.log('Playing audio');
        audioElementRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          if (onError) {
            onError();
          }
        });
      } else {
        console.log('Pausing audio');
        audioElementRef.current.pause();
      }
    }
  }, [isPlaying, isLoaded, onError]);

  // Gérer les changements de volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Exposer les méthodes de contrôle via la référence
  useImperativeHandle(ref, () => ({
    seekTo: (position: number) => {
      if (audioElementRef.current) {
        const newTime = position * audioElementRef.current.duration;
        audioElementRef.current.currentTime = newTime;
        if (onSeek) {
          onSeek(position);
        }
      }
    },
    skipForward: (seconds: number) => {
      if (audioElementRef.current) {
        const newTime = Math.min(audioElementRef.current.currentTime + seconds, audioElementRef.current.duration);
        audioElementRef.current.currentTime = newTime;
        const newPosition = newTime / audioElementRef.current.duration;
        if (onSeek) {
          onSeek(newPosition);
        }
      }
    },
    skipBackward: (seconds: number) => {
      if (audioElementRef.current) {
        const newTime = Math.max(audioElementRef.current.currentTime - seconds, 0);
        audioElementRef.current.currentTime = newTime;
        const newPosition = newTime / audioElementRef.current.duration;
        if (onSeek) {
          onSeek(newPosition);
        }
      }
    },
    getDuration: () => {
      return audioElementRef.current ? audioElementRef.current.duration : 0;
    }
  }));

  return (
    <div className="local-audio-player">
      {showVisualizer && (
        <canvas 
          ref={canvasRef} 
          className="audio-visualizer"
          style={{ 
            width: '100%', 
            height: '80px', 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        />
      )}
      {isBuffering && (
        <div className="buffering-indicator">
          <div className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <span className="ms-2">Mise en mémoire tampon...</span>
        </div>
      )}
    </div>
  );
});

export default LocalAudioPlayer;
