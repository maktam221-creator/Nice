export interface User {
  name: string;
  avatarUrl: string;
  gender?: { value: string; isPublic: boolean };
  bio?: string;
  country?: { value:string; isPublic: boolean };
  isOnline?: boolean;
}

export interface Comment {
  id: number;
  author: User;
  text: string;
}

export interface Post {
  id: number;
  author: User;
  text: string;
  imageUrl?: string;
  likes: number;
  shares: number;
  isLiked: boolean;
  comments: Comment[];
  timestamp: string;
}
// Notification and NotificationType types.
export type NotificationType = 'like' | 'comment' | 'follow' | 'message';

export interface Notification {
  id: number;
  type: NotificationType;
  actor: User;
  read: boolean;
  timestamp: string;
}

export interface Message {
  id: number;
  senderKey: string;
  receiverKey: string;
  text: string;
  timestamp: string;
}