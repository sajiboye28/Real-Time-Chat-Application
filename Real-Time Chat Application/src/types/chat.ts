export interface User {
  id: string;
  username: string;
  avatar: string;
  joinedAt: Date;
}

export interface Message {
  id: number;
  text: string;
  user: User;
  timestamp: Date;
  type: 'message' | 'system';
}

export interface TypingUser {
  user: User;
  typing: boolean;
}