import { User, Post, Notification, Message, Story, Reel } from './types';

type ProfileView = { viewer: User; timestamp: string };

export const initialUsers: Record<string, User> = {};

export const initialPosts: Post[] = [];

export const initialReels: Reel[] = [];

export const initialProfileViews: Record<string, ProfileView[]> = {};

export const initialNotifications: Notification[] = [];

export const initialMessages: Message[] = [];
export const initialStories: Story[] = [];