import React, { useState, useRef } from 'react';
import { Form, Button, InputGroup, Modal, Nav, Alert } from 'react-bootstrap';
import { FaPlus, FaYoutube, FaSearch, FaLock, FaUpload, FaMusic, FaFile } from 'react-icons/fa';

interface AddTrackFormProps {
  onAddYouTubeTrack: (youtubeUrl: string) => void;
  onAddLocalTrack?: (file: File, isLocalOnly: boolean) => void;
  isSubmitting?: boolean;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

const AddTrackForm: React.FC<AddTrackFormProps> = ({
  onAddYouTubeTrack,
  onAddLocalTrack,
  isSubmitting: externalIsSubmitting = false,
  isAuthenticated = false,
  onLoginRequired
}) => {
  const [showModal, setShowModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLocalOnly, setIsLocalOnly] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const files = e.target.files;
    setFileError(null);
    
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    
    // Vérifier si c'est un fichier audio
    if (!file.type.startsWith('audio/')) {
      setFileError('Veuillez sélectionner un fichier audio valide (MP3, WAV, etc.)');
      setSelectedFile(null);
      return;
    }
    
    // Vérifier la taille du fichier (max 20 MB)
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      setFileError('Le fichier est trop volumineux. Taille maximale: 20 MB');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    if (!selectedFile || !onAddLocalTrack || isSubmitting) {
      return;
    }
    
    try {
      setInternalIsSubmitting(true);
      await onAddLocalTrack(selectedFile, isLocalOnly);
      // Reset form
      setSelectedFile(null);
      setIsLocalOnly(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fichier audio:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  // Formater la taille du fichier en KB ou MB
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        size="lg"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>Ajouter un morceau</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'youtube'} 
                onClick={() => setActiveTab('youtube')}
                className={activeTab === 'youtube' ? 'text-light' : 'text-muted'}
              >
                <FaYoutube className="me-2" /> YouTube
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'upload'} 
                onClick={() => setActiveTab('upload')}
                className={activeTab === 'upload' ? 'text-light' : 'text-muted'}
              >
                <FaUpload className="me-2" /> Fichier local
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === 'youtube' && (
            <>
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
            </>
          )}

          {activeTab === 'upload' && (
            <>
              <div className="mb-3 d-flex align-items-center justify-content-center">
                <FaMusic className="me-2" size={24} /> 
                <h5 className="mb-0">Ajouter un fichier audio local</h5>
              </div>

              {fileError && (
                <Alert variant="danger" className="mb-3">
                  {fileError}
                </Alert>
              )}

              <Form onSubmit={handleFileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Sélectionner un fichier audio</Form.Label>
                  <InputGroup>
                    <Form.Control
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="bg-darker text-light border-secondary"
                      required
                      disabled={isSubmitting}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Formats supportés: MP3, WAV, OGG, etc. (max 20 MB)
                  </Form.Text>
                </Form.Group>

                {selectedFile && (
                  <div className="mb-3 p-3 border border-secondary rounded">
                    <div className="d-flex align-items-center">
                      <FaFile className="me-2" size={24} />
                      <div>
                        <p className="mb-0 fw-bold">{selectedFile.name}</p>
                        <small className="text-muted">
                          {selectedFile.type} • {formatFileSize(selectedFile.size)}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="localOnlyCheck"
                    label="Ajouter uniquement à la section Musiques Locales"
                    checked={isLocalOnly}
                    onChange={(e) => setIsLocalOnly(e.target.checked)}
                    className="text-light"
                  />
                  <Form.Text className="text-muted">
                    {isLocalOnly 
                      ? "Ce fichier sera disponible uniquement dans la section Musiques Locales avec le lecteur optimisé" 
                      : "Ce fichier sera ajouté à la file d'attente principale"}
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={!selectedFile || isSubmitting || !onAddLocalTrack}
                  >
                    {isSubmitting ? 'Upload en cours...' : 'Uploader et ajouter à la playlist'}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTrackForm;
