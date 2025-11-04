import { User, Post, Reel, Story, Notification, Message, Comment } from './types';

export const initialUsers: Record<string, User> = {
  // Guest user removed to support authentication flow
  'user1': { uid: 'user1', name: 'أحمد محمود', avatarUrl: 'https://i.pravatar.cc/150?u=user1', isOnline: true, bio: 'مطور ويب وشغوف بالتقنية.', country: { value: 'مصر', isPublic: true }, gender: { value: 'ذكر', isPublic: true } },
  'user2': { uid: 'user2', name: 'فاطمة الزهراء', avatarUrl: 'https://i.pravatar.cc/150?u=user2', isOnline: false, bio: 'مصممة جرافيك ومحبة للفن.', country: { value: 'السعودية', isPublic: true }, gender: { value: 'أنثى', isPublic: true } },
  'user3': { uid: 'user3', name: 'علي حسن', avatarUrl: 'https://i.pravatar.cc/150?u=user3', isOnline: true, bio: 'رائد أعمال ومهتم بالاستثمار.' },
  'user4': { uid: 'user4', name: 'نور محمد', avatarUrl: 'https://i.pravatar.cc/150?u=user4', isOnline: true, bio: 'طالبة طب وناشطة اجتماعية.' },
  'user5': { uid: 'user5', name: 'خالد عبد الله', avatarUrl: 'https://i.pravatar.cc/150?u=user5', isOnline: false, bio: 'مصور فوتوغرافي محترف.' },
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
    isSaved: true,
  },
  {
    id: 2,
    author: initialUsers['user2'],
    text: 'متحمسة لبناء هذا التطبيق. لنبدأ!',
    likes: 32,
    comments: 2, // Adjusted comment count
    timestamp: 'منذ 10 دقائق',
    isLiked: true,
    isSaved: false,
  },
  {
    id: 3,
    author: initialUsers['user3'],
    text: 'ما هي أفضل استراتيجية استثمار للمبتدئين في عام 2024؟ شاركوني آرائكم.',
    likes: 58,
    comments: 12,
    timestamp: 'منذ ساعة',
    isLiked: false,
    isSaved: false,
  },
    {
    id: 4,
    author: initialUsers['user5'],
    text: 'صورة التقطتها عند شروق الشمس هذا الصباح.',
    imageUrl: 'https://picsum.photos/seed/post4/600/400',
    likes: 120,
    comments: 25,
    timestamp: 'منذ 3 ساعات',
    isLiked: true,
    isSaved: true,
  },
];

export const initialComments: Record<number, Comment[]> = {
    1: [
        { id: 101, author: initialUsers['user2'], text: 'أهلاً بك يا أحمد!' },
        { id: 102, author: initialUsers['user3'], text: 'منشور رائع!' },
    ],
    2: [
        { id: 201, author: initialUsers['user1'], text: 'بالتوفيق يا فاطمة!' },
        { id: 203, author: initialUsers['user4'], text: 'هيا بنا!' },
    ],
    3: [],
    4: [
        { id: 401, author: initialUsers['user2'], text: 'لقطة مذهلة! الألوان رائعة.'}
    ]
};

export const initialReels: Reel[] = [
    {
        id: 1,
        author: initialUsers['user4'],
        videoUrl: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
        caption: 'يوم في حياتي كطالبة طب 👩‍⚕️',
        music: 'Lo-fi Hip Hop',
        likes: 250,
        isLiked: false,
        shares: 45,
        comments: [
            { id: 301, author: initialUsers['user1'], text: 'محتوى ملهم جداً!' }
        ],
    },
    {
        id: 2,
        author: initialUsers['user5'],
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        caption: 'استكشاف الطبيعة الخلابة 🌲',
        likes: 480,
        isLiked: true,
        shares: 90,
        comments: [],
    }
];

export const initialStories: Record<string, Story[]> = {
    'user1': [
        { id: 101, type: 'text', content: 'صباح الخير جميعاً!', backgroundColor: 'bg-gradient-to-br from-sky-400 to-blue-600', timestamp: new Date() },
    ],
    'user2': [
        { id: 201, type: 'image', content: 'https://picsum.photos/seed/story1/1080/1920', caption: 'تصميم جديد أعمل عليه', timestamp: new Date() },
        { id: 202, type: 'image', content: 'https://picsum.photos/seed/story2/1080/1920', caption: 'قهوة وفن', timestamp: new Date() },
    ],
    'user3': [
        { id: 301, type: 'text', content: 'نصيحة اليوم: استثمر في نفسك أولاً.', backgroundColor: 'bg-gradient-to-br from-slate-700 to-slate-900', timestamp: new Date() },
    ]
};

export const initialNotifications: Notification[] = [
    { id: 1, actor: initialUsers['user2'], type: 'like', timestamp: 'منذ 15 دقيقة', read: false },
    { id: 2, actor: initialUsers['user3'], type: 'follow', timestamp: 'منذ ساعة', read: false },
    { id: 3, actor: initialUsers['user1'], type: 'comment', timestamp: 'منذ 3 ساعات', read: true },
    { id: 4, actor: initialUsers['user2'], type: 'message', timestamp: 'منذ يوم', read: true },
];

export const initialMessages: Message[] = [
    { id: 1, senderKey: 'user2', receiverKey: 'user1', text: 'مرحباً يا أحمد! كيف حالك؟', timestamp: new Date(Date.now() - 60000 * 5) },
    { id: 2, senderKey: 'user1', receiverKey: 'user2', text: 'أهلاً يا فاطمة! أنا بخير، شكراً لسؤالك.', timestamp: new Date(Date.now() - 60000 * 4) },
];
