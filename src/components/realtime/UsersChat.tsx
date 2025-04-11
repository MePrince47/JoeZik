import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, ListGroup, Image } from 'react-bootstrap';
import { FaPaperPlane, FaCrown, FaTrash } from 'react-icons/fa';
import { UserProfile } from '@/types/user';
import { 
  ChatMessage, 
  getChatMessages, 
  addChatMessage, 
  deleteChatMessage, 
  ChatEventEmitter, 
  ChatEvents,
  emitNewMessage,
  emitDeleteMessage
} from '@/lib/chat/chatService';

interface UsersChatProps {
  currentUser: UserProfile | null;
  onlineUsers?: UserProfile[];
}

const UsersChat: React.FC<UsersChatProps> = ({
  currentUser,
  onlineUsers = []
}) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatEventEmitter = ChatEventEmitter.getInstance();

  // Charger les messages de chat au chargement du composant
  useEffect(() => {
    setChatMessages(getChatMessages());
    
    // S'abonner aux événements de chat
    const handleNewMessage = (newMessage: ChatMessage) => {
      setChatMessages(prevMessages => [...prevMessages, newMessage]);
    };
    
    const handleDeleteMessage = (messageId: string) => {
      setChatMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
    };
    
    chatEventEmitter.on(ChatEvents.NEW_MESSAGE, handleNewMessage);
    chatEventEmitter.on(ChatEvents.DELETE_MESSAGE, handleDeleteMessage);
    
    return () => {
      chatEventEmitter.off(ChatEvents.NEW_MESSAGE, handleNewMessage);
      chatEventEmitter.off(ChatEvents.DELETE_MESSAGE, handleDeleteMessage);
    };
  }, []);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentUser) {
      const newMessage = addChatMessage(
        currentUser.id,
        currentUser.username,
        currentUser.avatarUrl,
        message.trim()
      );
      
      // Émettre l'événement de nouveau message
      emitNewMessage(newMessage);
      
      setMessage('');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (currentUser) {
      const success = deleteChatMessage(messageId, currentUser.id);
      if (success) {
        // Émettre l'événement de suppression de message
        emitDeleteMessage(messageId);
      }
    }
  };

  // Format timestamp to HH:MM
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Combiner les utilisateurs en ligne avec l'utilisateur actuel
  const allUsers = [...onlineUsers];
  if (currentUser && !allUsers.some(user => user.id === currentUser.id)) {
    allUsers.push(currentUser);
  }

  // Sort users: online first, then by points
  const sortedUsers = [...allUsers].sort((a, b) => {
    const aIsOnline = onlineUsers.some(user => user.id === a.id);
    const bIsOnline = onlineUsers.some(user => user.id === b.id);
    
    if (aIsOnline !== bIsOnline) return aIsOnline ? -1 : 1;
    return b.points - a.points;
  });

  return (
    <div className="jz-users-chat d-flex flex-column h-100">
      <div className="jz-header d-flex justify-content-around">
        <Button 
          variant={activeTab === 'users' ? 'primary' : 'outline-light'}
          onClick={() => setActiveTab('users')}
          className="flex-grow-1 me-1"
        >
          Utilisateurs ({onlineUsers.length})
        </Button>
        <Button 
          variant={activeTab === 'chat' ? 'primary' : 'outline-light'}
          onClick={() => setActiveTab('chat')}
          className="flex-grow-1 ms-1"
        >
          Chat
        </Button>
      </div>

      <div className="flex-grow-1 overflow-auto">
        {activeTab === 'users' ? (
          <ListGroup variant="flush">
            {sortedUsers.map(user => (
              <ListGroup.Item 
                key={user.id}
                className="bg-transparent border-bottom border-secondary d-flex align-items-center p-2"
              >
                <div className="position-relative me-2">
                  <Image 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    roundedCircle 
                    width={40} 
                    height={40}
                    className={!onlineUsers.some(u => u.id === user.id) ? 'opacity-50' : ''}
                  />
                  {onlineUsers.some(u => u.id === user.id) && (
                    <div 
                      className="position-absolute bottom-0 end-0" 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        backgroundColor: '#1db954', 
                        borderRadius: '50%',
                        border: '2px solid var(--jz-chat-bg)'
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <span className={`fw-bold ${!onlineUsers.some(u => u.id === user.id) ? 'text-muted' : ''}`}>
                      {user.username}
                    </span>
                    {user.isAdmin && (
                      <FaCrown className="ms-1 text-warning" size={12} />
                    )}
                  </div>
                  <small className="text-muted">{user.points} points</small>
                </div>
                
                {currentUser && user.id === currentUser.id && (
                  <span className="badge bg-primary">Vous</span>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="p-2">
            {chatMessages.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p>Aucun message. Commencez la conversation!</p>
              </div>
            ) : (
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`mb-3 d-flex ${currentUser && msg.userId === currentUser.id ? 'justify-content-end' : ''}`}
                  >
                    {(!currentUser || msg.userId !== currentUser.id) && (
                      <Image 
                        src={msg.userAvatar} 
                        alt={msg.username} 
                        roundedCircle 
                        width={32} 
                        height={32}
                        className="me-2 align-self-end"
                      />
                    )}
                    
                    <div 
                      className={`message-bubble p-2 rounded position-relative ${
                        currentUser && msg.userId === currentUser.id 
                          ? 'bg-primary text-white' 
                          : 'bg-secondary text-white'
                      }`}
                      style={{ maxWidth: '80%' }}
                    >
                      {(!currentUser || msg.userId !== currentUser.id) && (
                        <div className="fw-bold small">{msg.username}</div>
                      )}
                      <div>{msg.content}</div>
                      <div className="text-end opacity-75 small">
                        {formatTime(msg.timestamp)}
                        {currentUser && msg.userId === currentUser.id && (
                          <Button 
                            variant="link" 
                            className="p-0 ms-2 text-white opacity-75"
                            onClick={() => handleDeleteMessage(msg.id)}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {currentUser && msg.userId === currentUser.id && (
                      <Image 
                        src={msg.userAvatar} 
                        alt={msg.username} 
                        roundedCircle 
                        width={32} 
                        height={32}
                        className="ms-2 align-self-end"
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === 'chat' && currentUser && (
        <Form onSubmit={handleSubmit} className="p-2 border-top border-secondary">
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Écrivez un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-darker text-light border-secondary"
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="ms-2"
              disabled={!message.trim()}
            >
              <FaPaperPlane />
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default UsersChat;
