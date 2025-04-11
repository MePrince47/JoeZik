import React from 'react';
import { Navbar, Container, Nav, Button, Image, Dropdown } from 'react-bootstrap';
import { FaMusic, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { UserProfile } from '@/types/user';

interface HeaderProps {
  roomName: string;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ roomName, currentUser, onLogout }) => {
  return (
    <Navbar className="jz-header" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <FaMusic className="me-2" />
          <span className="fw-bold">JoeZik</span>
        </Navbar.Brand>
        
        <div className="mx-auto">
          <h5 className="mb-0 text-center">{roomName}</h5>
        </div>
        
        <Nav className="ms-auto">
          {currentUser ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-user">
                <div className="d-flex align-items-center">
                  <Image 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.username} 
                    width={24} 
                    height={24} 
                    roundedCircle 
                    className="me-2"
                  />
                  {currentUser.username}
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu variant="dark">
                <Dropdown.Item>
                  <FaUser className="me-2" /> Profil
                </Dropdown.Item>
                <Dropdown.Item>
                  <FaCog className="me-2" /> Paramètres
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>
                  <FaSignOutAlt className="me-2" /> Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button variant="outline-light" size="sm">
              <FaUser className="me-1" /> Connexion
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
