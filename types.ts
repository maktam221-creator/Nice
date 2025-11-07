import { PostgrestError } from '@supabase/supabase-js';

// Based on Supabase auth.users table and profiles table
export interface User {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface Like {
  user_id: string;
}

export interface Comment {
  id: string;
  text: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles?: Pick<User, 'username' | 'avatar_url'>; // Include user profile
}

// Based on Supabase posts table
export interface Post {
  id: string;
  user_id: string;
  image_url?: string;
  video_url?: string;
  caption: string;
  likes: Like[]; 
  comments: Comment[]; 
  created_at: string;
  profiles: User; // Joined profile data
}

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }>
  ? Exclude<U, null>
  : never;
export type DbResultErr = PostgrestError;

export interface HowToStep {
  title: string;
  description: string;
}

export type View = {
  page: 'feed' | 'profile';
  userId?: string;
};