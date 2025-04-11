import { v4 as uuidv4 } from 'uuid';

// Clés de stockage
const CHAT_MESSAGES_STORAGE_KEY = 'joezik_chat_messages';

// Interface pour les messages de chat
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

// Fonction pour obtenir tous les messages de chat
export const getChatMessages = (): ChatMessage[] => {
  try {
    const messagesJson = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de chat:', error);
    return [];
  }
};

// Fonction pour sauvegarder les messages de chat
export const saveChatMessages = (messages: ChatMessage[]): void => {
  try {
    localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des messages de chat:', error);
  }
};

// Fonction pour ajouter un message de chat
export const addChatMessage = (
  userId: string,
  username: string,
  userAvatar: string,
  content: string
): ChatMessage => {
  const newMessage: ChatMessage = {
    id: uuidv4(),
    userId,
    username,
    userAvatar,
    content,
    timestamp: new Date().toISOString()
  };
  
  const messages = getChatMessages();
  
  // Limiter le nombre de messages stockés (garder les 100 derniers)
  if (messages.length >= 100) {
    messages.shift(); // Supprimer le message le plus ancien
  }
  
  messages.push(newMessage);
  saveChatMessages(messages);
  
  return newMessage;
};

// Fonction pour supprimer un message de chat
export const deleteChatMessage = (messageId: string, userId: string): boolean => {
  const messages = getChatMessages();
  const messageIndex = messages.findIndex(message => message.id === messageId);
  
  if (messageIndex === -1) {
    return false;
  }
  
  // Vérifier que l'utilisateur est l'auteur du message
  if (messages[messageIndex].userId !== userId) {
    return false;
  }
  
  messages.splice(messageIndex, 1);
  saveChatMessages(messages);
  
  return true;
};

// Fonction pour obtenir les messages de chat récents
export const getRecentChatMessages = (limit: number = 20): ChatMessage[] => {
  const messages = getChatMessages();
  return messages.slice(-limit).sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
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
