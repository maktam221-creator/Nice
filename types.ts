
// Fix: Added optional fields to User type to support profile information.
export interface User {
  uid: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  isOnline?: boolean;
  gender?: {
      value: string;
      isPublic: boolean;
  };
  country?: {
      value: string;
      isPublic: boolean;
  };
}

export interface Post {
  id: number;
  author: User;
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

// Fix: Added missing Comment type definition.
export interface Comment {
  id: number;
  author: User;
  text: string;
}

// Fix: Added missing Reel type definition.
export interface Reel {
  id: number;
  author: User;
  videoUrl: string;
  caption: string;
  music?: string;
  likes: number;
  isLiked: boolean;
  shares: number;
  comments: Comment[];
}

// Fix: Added missing NotificationType type definition.
export type NotificationType = 'like' | 'comment' | 'follow' | 'message';

// Fix: Added missing Notification type definition.
export interface Notification {
  id: number;
  actor: User;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

// Fix: Added missing Message type definition.
export interface Message {
  id: number;
  senderKey: string;
  receiverKey: string;
  text: string;
  timestamp: Date;
}

// Fix: Added missing Story type definition.
export interface Story {
  id: number;
  type: 'image' | 'text';
  content: string;
  caption?: string;
  backgroundColor?: string;
  timestamp: Date;
  viewed?: boolean;
}