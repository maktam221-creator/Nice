
export interface User {
  name: string;
  avatarUrl: string;
  gender?: string;
  bio?: string;
  country?: string;
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

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: number;
  type: NotificationType;
  actor: User;
  post?: Post;
  read: boolean;
  timestamp: string;
}
