import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown, FaPlay, FaCheck, FaTrash } from 'react-icons/fa';
import { Track, hasUserVotedForTrack } from '@/lib/playlist/trackService';

interface TrackQueueProps {
  tracks: Track[];
  currentTrackId: string | null;
  onTrackSelect: (trackId: string) => void;
  onVoteUp: (trackId: string) => void;
  onVoteDown: (trackId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  currentUserId?: string | null;
}

const TrackQueue: React.FC<TrackQueueProps> = ({
  tracks,
  currentTrackId,
  onTrackSelect,
  onVoteUp,
  onVoteDown,
  onDeleteTrack,
  currentUserId
}) => {
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return ( 
    <div className="jz-queue p-2"> 
      <div className="d-flex justify-content-between align-items-center mb-5 px-2">
        <h5 className="mb-0">File d&apos;attente</h5>
        <Badge bg="primary" pill>{tracks.length}</Badge>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p>La file d&apos;attente est vide</p>
        </div>
      ) : (
        <ListGroup variant="flush">
          {tracks.map(track => (
            <ListGroup.Item 
              key={track.id}
              className={`bg-transparent border-bottom border-secondary d-flex align-items-center p-2 ${currentTrackId === track.id ? 'bg-dark' : ''}`}
            >
              <div 
                className="track-cover me-2" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundImage: `url(${track.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '4px'
                }}
              />
              
              <div className="flex-grow-1 me-2 overflow-hidden">
                <div className="d-flex justify-content-between">
                  <div className="text-truncate">
                    <p className="mb-0 fw-bold text-truncate">{track.title}</p>
                    <small className="text-muted">{track.artist}</small>
                  </div>
                  <small className="text-muted ms-2">{formatTime(track.duration)}</small>
                </div>
                <small className="text-muted d-block">Ajouté par {track.addedBy}</small>
              </div>
              
              <div className="d-flex align-items-center">
                <Button 
                  variant="link" 
                  className={`p-1 ${currentUserId && hasUserVotedForTrack(currentUserId, track.id) ? 'text-success' : 'text-muted'}`}
                  onClick={() => onVoteUp(track.id)}
                >
                  <FaThumbsUp />
                  {currentUserId && hasUserVotedForTrack(currentUserId, track.id) && (
                    <small className="position-absolute" style={{ fontSize: '0.5rem', top: 0, right: 0 }}>
                      <FaCheck />
                    </small>
                  )}
                </Button>
                <span className={`mx-1 ${track.voteScore > 0 ? 'text-success' : track.voteScore < 0 ? 'text-danger' : ''}`}>
                  {track.voteScore}
                </span>
                <Button 
                  variant="link" 
                  className="text-danger p-1" 
                  onClick={() => onVoteDown(track.id)}
                >
                  <FaThumbsDown />
                </Button>
                
                {currentTrackId !== track.id && (
                  <Button 
                    variant="link" 
                    className="text-light p-1 ms-2" 
                    onClick={() => onTrackSelect(track.id)}
                  >
                    <FaPlay />
                  </Button>
                )}
                
                {/* Bouton de suppression - visible uniquement pour l'utilisateur qui a ajouté la piste */}
                {currentUserId && track.addedById === currentUserId && onDeleteTrack && (
                  <Button 
                    variant="link" 
                    className="text-danger p-1 ms-2" 
                    onClick={() => onDeleteTrack(track.id)}
                    title="Supprimer cette piste"
                  >
                    <FaTrash />
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default TrackQueue;
