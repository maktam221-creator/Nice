import { User, Post, Notification, Message, Story, Reel } from './types';

type ProfileView = { viewer: User; timestamp: string };

const USERS_DATA: User[] = [
    { uid: 'user1', name: 'أحمد محمود', avatarUrl: 'https://picsum.photos/seed/user1/100/100', bio: 'مهندس برمجيات ومحب للقهوة.', country: { value: 'مصر', isPublic: true }, gender: { value: 'ذكر', isPublic: true }, isOnline: true },
    { uid: 'user2', name: 'فاطمة الزهراء', avatarUrl: 'https://picsum.photos/seed/user2/100/100', bio: 'مصممة جرافيك | أعشق الفن والألوان.', country: { value: 'السعودية', isPublic: true }, gender: { value: 'أنثى', isPublic: true }, isOnline: false },
    { uid: 'user3', name: 'خالد عبد الله', avatarUrl: 'https://picsum.photos/seed/user3/100/100', bio: 'رائد أعمال ومتحدث ملهم.', country: { value: 'الإمارات', isPublic: true }, gender: { value: 'ذكر', isPublic: true }, isOnline: true },
    { uid: 'user4', name: 'نور الهدى', avatarUrl: 'https://picsum.photos/seed/user4/100/100', bio: 'طالبة طب شغوفة بالعلوم.', country: { value: 'الأردن', isPublic: false }, gender: { value: 'أنثى', isPublic: true }, isOnline: true },
    { uid: 'user5', name: 'يوسف إبراهيم', avatarUrl: 'https://picsum.photos/seed/user5/100/100', bio: 'مصور فوتوغرافي محترف.', country: { value: 'المغرب', isPublic: true }, gender: { value: 'ذكر', isPublic: false }, isOnline: false },
];

export const initialUsers: Record<string, User> = USERS_DATA.reduce((acc, user) => {
    acc[user.uid] = user;
    return acc;
}, {} as Record<string, User>);


export const initialPosts: Post[] = [
  {
    id: 1,
    author: initialUsers['user1'],
    text: 'ما أجمل الاستيقاظ على شروق الشمس، بداية يوم جديد مليء بالأمل والتفاؤل! ☀️',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    likes: 120,
    shares: 15,
    isLiked: false,
    isSaved: false,
    comments: [
      { id: 101, author: initialUsers['user2'], text: 'منظر رائع بالفعل!' },
      { id: 102, author: initialUsers['user3'], text: 'أتفق معك، صباح الخير!' },
    ],
    timestamp: 'منذ ساعتين',
  },
  {
    id: 2,
    author: initialUsers['user2'],
    text: 'أنهيت للتو هذا التصميم الجديد، ما رأيكم؟ 🎨\n#فن #تصميم #إبداع',
    likes: 250,
    shares: 30,
    isLiked: true,
    isSaved: true,
    comments: [
       { id: 201, author: initialUsers['user1'], text: 'مبدعة كالعادة!' },
    ],
    timestamp: 'منذ ٥ ساعات',
  },
   {
    id: 3,
    author: initialUsers['user4'],
    text: 'أوقات المذاكرة المتأخرة... دعواتكم في امتحاناتي القادمة! 📚🔬',
    imageUrl: 'https://picsum.photos/seed/post3/600/400',
    likes: 95,
    shares: 5,
    isLiked: false,
    isSaved: false,
    comments: [],
    timestamp: 'أمس',
  },
];

export const initialReels: Reel[] = [
    { id: 1, author: initialUsers['user5'], videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', caption: 'لقطات من رحلتي الأخيرة إلى الجبال', likes: 540, shares: 80, isLiked: false, comments: [], timestamp: 'منذ يومين', music: 'Inspiring Adventures' },
    { id: 2, author: initialUsers['user3'], videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', caption: 'نصيحة سريعة لرواد الأعمال الشباب!', likes: 1200, shares: 250, isLiked: true, comments: [], timestamp: 'منذ أسبوع', music: 'Corporate Upbeat' },
];

export const initialProfileViews: Record<string, ProfileView[]> = {
    'user1': [{ viewer: initialUsers['user2'], timestamp: 'منذ ساعة' }, { viewer: initialUsers['user3'], timestamp: 'منذ 3 ساعات' }],
};

export const initialNotifications: Notification[] = [
    { id: 1, type: 'follow', actor: initialUsers['user5'], read: false, timestamp: 'منذ 10 دقائق' },
    { id: 2, type: 'like', actor: initialUsers['user3'], read: false, timestamp: 'منذ 25 دقيقة' },
    { id: 3, type: 'comment', actor: initialUsers['user1'], read: true, timestamp: 'منذ ساعة' },
];

export const initialMessages: Message[] = [
    { id: 1, senderKey: 'user2', receiverKey: 'user1', text: 'أهلاً أحمد، كيف حالك؟', timestamp: '10:30 ص' },
    { id: 2, senderKey: 'user1', receiverKey: 'user2', text: 'أهلاً فاطمة، أنا بخير الحمد لله. ماذا عنك؟', timestamp: '10:31 ص' },
];
export const initialStories: Story[] = [
    { id: 1, authorKey: 'user1', type: 'image', content: 'https://picsum.photos/seed/story1/1080/1920', caption: 'يوم جميل!', timestamp: new Date(Date.now() - 3600 * 1000 * 3), viewedBy: [] },
    { id: 2, authorKey: 'user2', type: 'text', content: 'قريبًا... مشروع جديد!', backgroundColor: 'bg-gradient-to-br from-pink-500 to-rose-500', timestamp: new Date(Date.now() - 3600 * 1000 * 6), viewedBy: [] },
    { id: 3, authorKey: 'user2', type: 'image', content: 'https://picsum.photos/seed/story2/1080/1920', caption: 'من كواليس العمل', timestamp: new Date(Date.now() - 3600 * 1000 * 5), viewedBy: [] },
];