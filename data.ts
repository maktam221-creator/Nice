import { User, Post, Notification, Message, Story, Reel } from './types';

type ProfileView = { viewer: User; timestamp: string };

export const initialUsers: Record<string, User> = {
  currentUser: { name: 'أنت', avatarUrl: 'https://picsum.photos/seed/you/100/100', bio: 'مرحباً! أنا أستخدم هذا التطبيق الرائع.', country: { value: 'السعودية', isPublic: true }, gender: { value: 'أنثى', isPublic: true }, isOnline: true },
  sara: { name: 'سارة', avatarUrl: 'https://picsum.photos/seed/sara/100/100', isOnline: true },
  ahmed: { name: 'أحمد', avatarUrl: 'https://picsum.photos/seed/ahmed/100/100', isOnline: false },
  fatima: { name: 'فاطمة', avatarUrl: 'https://picsum.photos/seed/fatima/100/100', isOnline: true },
  youssef: { name: 'يوسف', avatarUrl: 'https://picsum.photos/seed/youssef/100/100', isOnline: true },
  layla: { name: 'ليلى', avatarUrl: 'https://picsum.photos/seed/layla/100/100', isOnline: false },
};

export const initialPosts: Post[] = [
  { id: 1, author: initialUsers.sara, text: 'يوم جميل في الحديقة اليوم! الطقس كان مثالياً. ☀️', imageUrl: 'https://picsum.photos/seed/garden/600/400', likes: 15, shares: 7, isLiked: false, timestamp: 'قبل 5 دقائق', comments: [ { id: 1, author: initialUsers.ahmed, text: 'صور رائعة!' }, { id: 2, author: initialUsers.fatima, text: 'أتمنى لو كنت هناك.' }, ], },
  { id: 2, author: initialUsers.ahmed, text: 'أنهيت للتو قراءة كتاب رائع. أوصي به بشدة لكل محبي الخيال العلمي.', likes: 8, shares: 2, isLiked: true, timestamp: 'قبل ساعة', comments: [], },
  { id: 3, author: initialUsers.currentUser, text: 'تجربة وصفة جديدة للعشاء الليلة. أتمنى أن تنجح!', likes: 2, shares: 1, isLiked: false, timestamp: 'قبل 3 ساعات', comments: [], },
];

export const initialReels: Reel[] = [
  {
    id: 1,
    author: initialUsers.youssef,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    caption: 'Just having some fun! 😂 #fun #dayout',
    likes: 120,
    shares: 12,
    isLiked: false,
    comments: [],
    timestamp: 'قبل يومين',
    music: 'Original Audio by youssef',
  },
  {
    id: 2,
    author: initialUsers.layla,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Chilling with the big bunny 🌳 #nature #animation',
    likes: 256,
    shares: 30,
    isLiked: true,
    comments: [
        { id: 1, author: initialUsers.sara, text: 'So cute!' }
    ],
    timestamp: 'قبل 4 أيام',
    music: 'Blender Foundation - Big Buck Bunny',
  },
  {
    id: 3,
    author: initialUsers.ahmed,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'This is so surreal and cool.',
    likes: 541,
    shares: 64,
    isLiked: false,
    comments: [],
    timestamp: 'قبل أسبوع',
    music: 'Blender Foundation - Elephant\'s Dream',
  }
];


export const initialProfileViews: Record<string, ProfileView[]> = {
  [initialUsers.currentUser.name]: [
    { viewer: initialUsers.sara, timestamp: 'قبل ساعتين' },
    { viewer: initialUsers.ahmed, timestamp: 'قبل يوم' }
  ]
};

export const initialNotifications: Notification[] = [
    { id: 1, type: 'follow', actor: initialUsers.sara, read: false, timestamp: 'قبل دقيقة' },
    { id: 2, type: 'like', actor: initialUsers.ahmed, read: false, timestamp: 'قبل 5 دقائق' },
    { id: 3, type: 'comment', actor: initialUsers.fatima, read: true, timestamp: 'قبل ساعة' },
];

export const initialMessages: Message[] = [
    { id: 1, senderKey: 'sara', receiverKey: 'currentUser', text: 'مرحباً! كيف حالك؟', timestamp: 'قبل 10 دقائق' },
    { id: 2, senderKey: 'currentUser', receiverKey: 'sara', text: 'أهلاً سارة! أنا بخير، شكراً لك. ماذا عنك؟', timestamp: 'قبل 8 دقائق' },
    { id: 3, senderKey: 'sara', receiverKey: 'currentUser', text: 'بخير أيضاً. هل رأيت المنشور الجديد؟', timestamp: 'قبل 5 دقائق' },
];

export const initialStories: Story[] = [
  { id: 1, authorKey: 'sara', type: 'image', content: 'https://picsum.photos/seed/story1/1080/1920', caption: 'مناظر خلابة!', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), viewedBy: ['currentUser'] },
  { id: 2, authorKey: 'sara', type: 'text', content: 'أفضل قهوة تذوقتها على الإطلاق!', backgroundColor: 'bg-gradient-to-br from-purple-500 to-indigo-600', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), viewedBy: [] },
  { id: 3, authorKey: 'ahmed', type: 'image', content: 'https://picsum.photos/seed/story2/1080/1920', caption: 'مغامرة جديدة', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), viewedBy: [] },
  { id: 4, authorKey: 'fatima', type: 'text', content: 'يوم هادئ ومريح 😌', backgroundColor: 'bg-gradient-to-br from-green-400 to-blue-500', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), viewedBy: ['currentUser'] },
];