import { User, Reel, Story, Notification, Message, Comment, Post } from './types';

// This mock data is used to provide initial content for the application,
// as some parts of the app rely on this data before fetching from the database.

// Mock Users
const user1: User = {
  uid: 'user-1-id',
  name: 'علياء',
  avatarUrl: 'https://i.pravatar.cc/150?u=user1',
  isOnline: true,
};

const user2: User = {
  uid: 'user-2-id',
  name: 'خالد',
  avatarUrl: 'https://i.pravatar.cc/150?u=user2',
};

const user3: User = {
  uid: 'user-3-id',
  name: 'فاطمة',
  avatarUrl: 'https://i.pravatar.cc/150?u=user3',
  isOnline: true,
};

export const initialUsers: Record<string, User> = {
  [user1.uid]: user1,
  [user2.uid]: user2,
  [user3.uid]: user3,
};

// Mock Comments for Posts and Reels
const postComments: Comment[] = [
  { id: 101, author: user2, text: 'منشور رائع!' },
  { id: 102, author: user3, text: 'أتفق معك تماماً' },
];

const reelComments: Comment[] = [
  { id: 1, author: user2, text: 'مقطع رائع!' },
  { id: 2, author: user3, text: 'أعجبني جداً' },
];

export const initialComments: Record<number, Comment[]> = {
  1001: postComments,
};


// Mock Posts
export const initialPosts: Post[] = [
  {
    id: 1001,
    author: user1,
    text: 'استمتعت كثيراً بقراءة كتاب "فن اللامبالاة". أنصح به بشدة لكل من يبحث عن منظور جديد للحياة.',
    likes: 15,
    comments: 2,
    shares: 5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isLiked: true,
    isSaved: false,
  },
  {
    id: 1002,
    author: user2,
    text: 'ما أجمل منظر الغروب اليوم!',
    imageUrl: 'https://picsum.photos/seed/sunset/600/400',
    likes: 42,
    comments: 0,
    shares: 12,
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
    isLiked: false,
    isSaved: true,
  },
  {
    id: 1003,
    author: user3,
    text: 'أبحث عن اقتراحات لمسلسلات جديدة. ما هي أفضل المسلسلات التي شاهدتموها مؤخراً؟',
    likes: 8,
    comments: 0,
    shares: 1,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isLiked: false,
    isSaved: false,
  }
];


// Mock Reels
export const initialReels: Reel[] = [
  {
    id: 1,
    author: user1,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    caption: 'يوم جميل في الحديقة',
    music: 'Original Audio',
    likes: 125,
    isLiked: false,
    shares: 12,
    comments: reelComments,
  },
  {
    id: 2,
    author: user2,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'تجربة طعام جديدة',
    likes: 302,
    isLiked: true,
    shares: 45,
    comments: [],
  },
  {
    id: 3,
    author: user3,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    caption: 'السفر والمغامرات',
    likes: 540,
    isLiked: false,
    shares: 88,
    comments: [],
  },
];

// Mock Stories
export const initialStories: Record<string, Story[]> = {
  [user1.uid]: [
    { id: 1, type: 'image', content: 'https://picsum.photos/1080/1920?random=1', caption: 'صباح الخير', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: 2, type: 'text', content: 'أفضل اقتباس قرأته اليوم', backgroundColor: 'bg-gradient-to-br from-green-400 to-blue-500', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  ],
  [user2.uid]: [
    { id: 3, type: 'image', content: 'https://picsum.photos/1080/1920?random=2', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
  ],
};

// Mock Notifications
export const initialNotifications: Notification[] = [
  { id: 1, actor: user2, type: 'follow', timestamp: 'منذ 5 دقائق', read: false },
  { id: 2, actor: user3, type: 'like', timestamp: 'منذ ساعة', read: false },
  { id: 3, actor: user1, type: 'comment', timestamp: 'منذ 3 ساعات', read: true },
  { id: 4, actor: user3, type: 'message', timestamp: 'منذ يوم', read: true },
];

// Mock Messages - These will only appear if the current user's ID matches one of the keys.
// The app logic handles filtering correctly.
export const initialMessages: Message[] = [
  { id: 1, senderKey: user2.uid, receiverKey: 'current-user-placeholder', text: 'مرحباً، كيف حالك؟', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
  { id: 2, senderKey: 'current-user-placeholder', receiverKey: user2.uid, text: 'أهلاً! أنا بخير، شكراً لك.', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
  { id: 3, senderKey: user3.uid, receiverKey: 'current-user-placeholder', text: 'هل أنت متاح لاجتماع الغد؟', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: 4, senderKey: user1.uid, receiverKey: user2.uid, text: 'هذا مجرد اختبار بين مستخدمين آخرين', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];