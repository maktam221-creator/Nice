
import { User, Post } from './types';

export const initialUsers: Record<string, User> = {
  'user1': { uid: 'user1', name: 'أحمد محمود', avatarUrl: 'https://picsum.photos/seed/user1/100/100' },
  'user2': { uid: 'user2', name: 'فاطمة الزهراء', avatarUrl: 'https://picsum.photos/seed/user2/100/100' },
};

export const initialPosts: Post[] = [
  {
    id: 1,
    author: initialUsers['user1'],
    text: 'مرحباً بالعالم! هذا هو أول منشور في ميدان.',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    likes: 15,
    comments: 2,
    timestamp: 'منذ 5 دقائق',
    isLiked: false,
  },
  {
    id: 2,
    author: initialUsers['user2'],
    text: 'متحمسة لبناء هذا التطبيق. لنبدأ!',
    likes: 32,
    comments: 5,
    timestamp: 'منذ 3 دقائق',
    isLiked: true,
  },
];
