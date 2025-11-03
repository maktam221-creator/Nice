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
  isSaved: boolean;
  comments: Comment[];
  timestamp: string;
}

export interface Reel {
  id: number;
  author: User;
  videoUrl: string;
  caption: string;
  likes: number;
  shares: number;
  isLiked: boolean;
  comments: Comment[];
  timestamp: string;
  music?: string;
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

export interface Story {
  id: number;
  authorKey: string;
  type: 'image' | 'text';
  content: string; // URL for image, text for text story
  caption?: string; // For image stories
  backgroundColor?: string; // For text stories
  timestamp: Date;
  viewedBy: string[]; // array of user keys who viewed it
}