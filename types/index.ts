

export interface User {
  id: string;
  username: string;
  room: string;
}

export interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  room: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  messageCount: number;
}

export interface TypingUser {
  username: string;
}


export interface ServerToClientEvents {
  'receive-message': (message: Message) => void;
  'user-joined': (data: { username: string; message: string }) => void;
  'user-left': (data: { username: string; message: string }) => void;
  'user-typing': (data: TypingUser) => void;
  'user-stop-typing': (data: TypingUser) => void;
  'room-users': (users: User[]) => void;
}

export interface ClientToServerEvents {
  'join': (userData: { username: string; room: string }) => void;
  'send-message': (messageData: { content: string }) => void;
  'typing': () => void;
  'stop-typing': () => void;
  'switch-room': (newRoom: string) => void;
}

export interface LoginFormData {
  username: string;
  room: string;
}

export interface MessageFormData {
  content: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RoomStats {
  totalMessages: number;
  activeUsers: number;
  lastActivity: string;
}