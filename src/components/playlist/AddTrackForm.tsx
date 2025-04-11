import React, { useState } from 'react';
import { Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { FaPlus, FaYoutube, FaUpload, FaSearch, FaLock } from 'react-icons/fa';

interface AddTrackFormProps {
  onAddYouTubeTrack: (youtubeUrl: string) => void;
  onAddUploadTrack: (file: File) => void;
  isSubmitting?: boolean;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const AddTrackForm: React.FC<AddTrackFormProps> = ({
  onAddYouTubeTrack,
  onAddUploadTrack,
  isSubmitting: externalIsSubmitting = false,
  isAuthenticated = false,
  onLoginRequired
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    if (selectedFile && !isSubmitting) {
      try {
        setInternalIsSubmitting(true);
        await onAddUploadTrack(selectedFile);
        // Reset form
        setSelectedFile(null);
        setShowModal(false);
      } catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
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
          <Modal.Title>Ajouter un morceau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex">
            <Button 
              variant={activeTab === 'youtube' ? 'primary' : 'outline-light'}
              className="w-50 me-2 d-flex align-items-center justify-content-center"
              onClick={() => setActiveTab('youtube')}
              disabled={isSubmitting}
            >
              <FaYoutube className="me-2" /> YouTube
            </Button>
            <Button 
              variant={activeTab === 'upload' ? 'primary' : 'outline-light'}
              className="w-50 d-flex align-items-center justify-content-center"
              onClick={() => setActiveTab('upload')}
              disabled={isSubmitting}
            >
              <FaUpload className="me-2" /> Upload
            </Button>
          </div>

          {activeTab === 'youtube' ? (
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
          ) : (
            <Form onSubmit={handleUploadSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Fichier audio (MP3, OGG, WAV)</Form.Label>
                <Form.Control
                  type="file"
                  accept="audio/mp3,audio/ogg,audio/wav"
                  onChange={handleFileChange}
                  className="bg-darker text-light border-secondary"
                  required
                  disabled={isSubmitting}
                />
                <Form.Text className="text-muted">
                  Taille maximale: 4MB
                </Form.Text>
              </Form.Group>
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                >
                  {isSubmitting ? 'Upload en cours...' : 'Uploader et ajouter'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTrackForm;
