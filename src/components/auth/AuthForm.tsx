import React, { useState } from 'react';

interface AuthFormProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (data: { username: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  onContinueAsGuest: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, onContinueAsGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État du formulaire de connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // État du formulaire d'inscription
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Gérer la soumission du formulaire de connexion
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await onLogin({ email: loginEmail, password: loginPassword });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire d'inscription
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Vérifier que les mots de passe correspondent
    if (registerPassword !== registerConfirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onRegister({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-form">
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Connexion
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Inscription
            </button>
          </li>
        </ul>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {isLogin ? (
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="loginEmail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-between">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onContinueAsGuest}
              disabled={isLoading}
            >
              Continuer en tant qu&apos;invité
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit}>
          <div className="mb-3">
            <label htmlFor="registerUsername" className="form-label">Nom d&apos;utilisateur</label>
            <input
              type="text"
              className="form-control"
              id="registerUsername"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerEmail" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="registerEmail"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerPassword" className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              id="registerPassword"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerConfirmPassword" className="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="form-control"
              id="registerConfirmPassword"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-between">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : 'S&apos;inscrire'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onContinueAsGuest}
              disabled={isLoading}
            >
              Continuer en tant qu&apos;invité
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
