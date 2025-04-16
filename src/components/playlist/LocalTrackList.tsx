import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import { FaPlay, FaCheck, FaTrash } from 'react-icons/fa';
import { Track } from '@/lib/playlist/trackService';

interface LocalTrackListProps {
  tracks: Track[];
  currentTrackId: string | null;
  onTrackSelect: (trackId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  currentUserId?: string | null;
}

const LocalTrackList: React.FC<LocalTrackListProps> = ({
  tracks,
  currentTrackId,
  onTrackSelect,
  onDeleteTrack,
  currentUserId
}) => {
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="local-tracks p-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h5 className="mb-0">Musiques Locales</h5>
        <Badge bg="info" pill>{tracks.length}</Badge>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p>Aucune musique locale disponible</p>
          <small className="d-block">Utilisez l&apos;option &quot;Fichier local&quot; pour ajouter des musiques à cette section</small>
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
                {currentTrackId !== track.id && (
                  <Button
                    variant="link"
                    className="text-light p-1 ms-2"
                    onClick={() => onTrackSelect(track.id)}
                  >
                    <FaPlay />
                  </Button>
                )}
                {currentTrackId === track.id && (
                  <span className="text-success p-1 ms-2">
                    <FaCheck />
                  </span>
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

export default LocalTrackList;
