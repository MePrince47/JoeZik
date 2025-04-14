import React, { useState } from 'react';
import { Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { FaPlus, FaYoutube, FaSearch, FaLock } from 'react-icons/fa';

interface AddTrackFormProps {
  onAddYouTubeTrack: (youtubeUrl: string) => void;
  isSubmitting?: boolean;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const AddTrackForm: React.FC<AddTrackFormProps> = ({
  onAddYouTubeTrack,
  isSubmitting: externalIsSubmitting = false,
  isAuthenticated = false,
  onLoginRequired
}) => {
  const [showModal, setShowModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  // Utiliser l'état de soumission externe s'il est fourni, sinon utiliser l'interne
  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    if (youtubeUrl.trim() && !isSubmitting) {
      try {
        setInternalIsSubmitting(true);
        await onAddYouTubeTrack(youtubeUrl);
        // Reset form
        setYoutubeUrl('');
        setShowModal(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la piste YouTube:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      } finally {
        setInternalIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="d-grid gap-2 p-2">
        <Button 
          variant="primary" 
          size="lg" 
          className="d-flex align-items-center justify-content-center"
          onClick={() => {
            if (!isAuthenticated && onLoginRequired) {
              onLoginRequired();
            } else {
              setShowModal(true);
            }
          }}
        >
          {!isAuthenticated ? (
            <>
              <FaLock className="me-2" /> Connectez-vous pour ajouter un morceau
            </>
          ) : (
            <>
              <FaPlus className="me-2" /> Ajouter un morceau
            </>
          )}
        </Button>
      </div>

      <Modal 
        show={showModal} 
        onHide={() => !isSubmitting && setShowModal(false)}
        centered
        contentClassName="bg-dark text-light"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>Ajouter un morceau YouTube</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex align-items-center justify-content-center">
            <FaYoutube className="me-2" size={24} /> 
            <h5 className="mb-0">Ajouter une vidéo YouTube</h5>
          </div>

          <Form onSubmit={handleYoutubeSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>URL YouTube</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="bg-darker text-light border-secondary"
                  required
                  disabled={isSubmitting}
                />
                <Button 
                  variant="outline-light" 
                  type="submit"
                  disabled={!youtubeUrl.trim() || isSubmitting}
                >
                  <FaSearch />
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Collez l&apos;URL d&apos;une vidéo YouTube
              </Form.Text>
            </Form.Group>
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit"
                disabled={!youtubeUrl.trim() || isSubmitting}
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter à la playlist'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTrackForm;
