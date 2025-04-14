import { ChatMessage } from './chatService';

// Fonction pour obtenir tous les messages de chat
export const getChatMessages = async (): Promise<ChatMessage[]> => {
  try {
    const response = await fetch('/api/chat');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des messages de chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de chat:', error);
    return [];
  }
};

// Fonction pour ajouter un message de chat
export const addChatMessage = async (
  userId: string,
  username: string,
  userAvatar: string,
  content: string
): Promise<ChatMessage> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'ajout du message de chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message de chat:', error);
    throw error;
  }
};

// Fonction pour supprimer un message de chat
export const deleteChatMessage = async (messageId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/chat?id=${messageId}&userId=${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression du message de chat');
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du message de chat ${messageId}:`, error);
    return false;
  }
};

// Fonction pour obtenir les messages de chat récents
export const getRecentChatMessages = async (limit: number = 20): Promise<ChatMessage[]> => {
  try {
    const response = await fetch(`/api/chat?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des messages de chat récents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de chat récents:', error);
    return [];
  }
};

// Type pour les callbacks d'événements
type MessageCallback = (message: ChatMessage) => void;
type MessageIdCallback = (messageId: string) => void;
type EventCallback = MessageCallback | MessageIdCallback;

// Classe pour gérer les événements de chat
export class ChatEventEmitter {
  private static instance: ChatEventEmitter;
  private listeners: { [event: string]: EventCallback[] } = {};
  
  private constructor() {
    // Singleton
  }
  
  public static getInstance(): ChatEventEmitter {
    if (!ChatEventEmitter.instance) {
      ChatEventEmitter.instance = new ChatEventEmitter();
    }
    return ChatEventEmitter.instance;
  }
  
  public on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  public off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  public emit(event: string, ...args: unknown[]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => {
      // @ts-expect-error - Nous savons que les arguments correspondent au type de callback
      callback(...args);
    });
  }
}

// Événements de chat
export const ChatEvents = {
  NEW_MESSAGE: 'new_message',
  DELETE_MESSAGE: 'delete_message'
};

// Fonction pour émettre un événement de nouveau message
export const emitNewMessage = (message: ChatMessage): void => {
  ChatEventEmitter.getInstance().emit(ChatEvents.NEW_MESSAGE, message);
};

// Fonction pour émettre un événement de suppression de message
export const emitDeleteMessage = (messageId: string): void => {
  ChatEventEmitter.getInstance().emit(ChatEvents.DELETE_MESSAGE, messageId);
};
