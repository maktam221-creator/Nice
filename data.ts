import { User, Post, Notification, Message, Story, Reel } from './types';

type ProfileView = { viewer: User; timestamp: string };

export const initialUsers: Record<string, User> = {
  ali: {
    name: 'ali', // Use the key as the name for matching
    avatarUrl: 'https://picsum.photos/seed/ali/100/100',
    bio: 'مطور واجهات أمامية ومحب للقهوة.',
    country: { value: 'السعودية', isPublic: true },
    gender: { value: 'ذكر', isPublic: true },
    isOnline: true,
  },
  sara: {
    name: 'sara',
    avatarUrl: 'https://picsum.photos/seed/sara/100/100',
    bio: 'مصممة UX/UI وشغوفة بالفن الرقمي.',
    country: { value: 'مصر', isPublic: true },
    gender: { value: 'أنثى', isPublic: false },
    isOnline: false,
  },
  ahmed: {
      name: 'ahmed',
      avatarUrl: 'https://picsum.photos/seed/ahmed/100/100',
      bio: 'مهندس برمجيات.',
      country: { value: 'الإمارات', isPublic: true },
      gender: { value: 'ذكر', isPublic: true },
  },
};

const aliUser = initialUsers['ali'];
const saraUser = initialUsers['sara'];
const ahmedUser = initialUsers['ahmed'];


export const initialPosts: Post[] = [
  {
    id: 1,
    author: aliUser,
    text: 'مرحباً بالعالم! هذا أول منشور لي على منصة ميدان. متحمس للتواصل معكم جميعاً. يمكنني تعديل هذا المنشور أو حذفه!',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    likes: 12,
    shares: 2,
    isLiked: false,
    isSaved: false,
    comments: [
        { id: 1, author: saraUser, text: 'أهلاً بك يا علي! تصميم رائع.' }
    ],
    timestamp: 'منذ 5 دقائق',
  },
  {
    id: 2,
    author: saraUser,
    text: 'قضيت وقتاً رائعاً في استكشاف الألوان في التصميم اليوم. الألوان لديها القدرة على تغيير شعور المستخدم بالكامل.',
    likes: 45,
    shares: 8,
    isLiked: true,
    isSaved: true,
    comments: [
        { id: 1, author: aliUser, text: 'أتفق تماماً! عمل مذهل.' },
        { id: 2, author: ahmedUser, text: 'جميل جداً!' }
    ],
    timestamp: 'منذ ساعة',
  },
];

export const initialReels: Reel[] = [];

export const initialProfileViews: Record<string, ProfileView[]> = {
    'ali': [
        { viewer: saraUser, timestamp: 'منذ 10 دقائق' }
    ]
};

export const initialNotifications: Notification[] = [
    { id: 1, type: 'follow', actor: saraUser, read: true, timestamp: 'منذ ساعتين' },
    { id: 2, type: 'like', actor: ahmedUser, read: false, timestamp: 'منذ 5 دقائق' },
];

export const initialMessages: Message[] = [];
export const initialStories: Story[] = [];