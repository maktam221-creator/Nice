import React, { useState, useEffect, useRef } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import ProfilePage from './components/ProfilePage';
import EditProfileModal from './components/EditProfileModal';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import BottomNavBar from './components/BottomNavBar';
import { Post, User, Notification } from './types';
import { HomeIcon, UserIcon, SearchIcon, XCircleIcon, BellIcon } from './components/Icons';

type ProfileView = { viewer: User; timestamp: string };
type Page = 'home' | 'profile';

const App: React.FC = () => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<string[]>(['sara']);
  const [profileViews, setProfileViews] = useState<Record<string, ProfileView[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialUsersData: Record<string, User> = {
      currentUser: { name: 'أنت', avatarUrl: 'https://picsum.photos/seed/you/100/100', bio: 'مرحباً! أنا أستخدم هذا التطبيق الرائع.', country: { value: 'السعودية', isPublic: true }, gender: { value: 'أنثى', isPublic: true } },
      sara: { name: 'سارة', avatarUrl: 'https://picsum.photos/seed/sara/100/100' },
      ahmed: { name: 'أحمد', avatarUrl: 'https://picsum.photos/seed/ahmed/100/100' },
      fatima: { name: 'فاطمة', avatarUrl: 'https://picsum.photos/seed/fatima/100/100' },
    };
    setUsers(initialUsersData);

    const initialPosts: Post[] = [
      { id: 1, author: initialUsersData.sara, text: 'يوم جميل في الحديقة اليوم! الطقس كان مثالياً. ☀️', imageUrl: 'https://picsum.photos/seed/garden/600/400', likes: 15, shares: 7, isLiked: false, timestamp: 'قبل 5 دقائق', comments: [ { id: 1, author: initialUsersData.ahmed, text: 'صور رائعة!' }, { id: 2, author: initialUsersData.fatima, text: 'أتمنى لو كنت هناك.' }, ], },
      { id: 2, author: initialUsersData.ahmed, text: 'أنهيت للتو قراءة كتاب رائع. أوصي به بشدة لكل محبي الخيال العلمي.', likes: 8, shares: 2, isLiked: true, timestamp: 'قبل ساعة', comments: [], },
      { id: 3, author: initialUsersData.currentUser, text: 'تجربة وصفة جديدة للعشاء الليلة. أتمنى أن تنجح!', likes: 2, shares: 1, isLiked: false, timestamp: 'قبل 3 ساعات', comments: [], },
    ];
    setPosts(initialPosts);
    
    setProfileViews({ [initialUsersData.currentUser.name]: [ { viewer: initialUsersData.sara, timestamp: 'قبل ساعتين' }, { viewer: initialUsersData.ahmed, timestamp: 'قبل يوم' } ] });

    const initialNotifications: Notification[] = [
        { id: 1, type: 'follow', actor: initialUsersData.sara, read: false, timestamp: 'قبل دقيقة' },
        { id: 2, type: 'like', actor: initialUsersData.ahmed, read: false, timestamp: 'قبل 5 دقائق' },
        { id: 3, type: 'comment', actor: initialUsersData.fatima, read: true, timestamp: 'قبل ساعة' },
    ];
    setNotifications(initialNotifications);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            isNotificationsOpen &&
            notificationsRef.current &&
            !notificationsRef.current.contains(event.target as Node) &&
            notificationButtonRef.current &&
            !notificationButtonRef.current.contains(event.target as Node)
        ) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);


  const handleAddPost = (text: string, imageUrl?: string) => {
    if (!users.currentUser) return;
    const newPost: Post = { id: Date.now(), author: users.currentUser, text, imageUrl, likes: 0, shares: 0, isLiked: false, timestamp: 'الآن', comments: [], };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: number) => {
    setPosts( posts.map((post) => { if (post.id === postId) { const isLiked = !post.isLiked; return { ...post, isLiked: isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1, }; } return post; }) );
  };

  const handleSharePost = (postId: number) => {
    setPosts( posts.map((post) => { if (post.id === postId) { return { ...post, shares: post.shares + 1 }; } return post; }) );
  };

  const handleAddComment = (postId: number, text: string) => {
    if (!users.currentUser) return;
    setPosts( posts.map((post) => { if (post.id === postId) { const newComment = { id: Date.now(), author: users.currentUser, text, }; return { ...post, comments: [...post.comments, newComment] }; } return post; }) );
  };

  const handleUpdateProfile = (updatedUser: User) => {
    const oldUser = users.currentUser;
    if (!oldUser) return;
    setUsers(prevUsers => ({ ...prevUsers, currentUser: updatedUser }));
    if (viewedProfileUser && viewedProfileUser.name === oldUser.name) { setViewedProfileUser(updatedUser); }
    setPosts(prevPosts => prevPosts.map(post => { const updatedPost = { ...post }; if (post.author.name === oldUser.name) { updatedPost.author = updatedUser; } updatedPost.comments = post.comments.map(comment => { if (comment.author.name === oldUser.name) { return { ...comment, author: updatedUser }; } return comment; }); return updatedPost; }));
  };

  const handleViewProfile = (user: User) => {
    if (users.currentUser && user.name !== users.currentUser.name) {
        const viewer = users.currentUser;
        setProfileViews(prev => {
            const viewsForUser = prev[user.name] || [];
            if (viewsForUser.length > 0 && viewsForUser[viewsForUser.length - 1].viewer.name === viewer.name) { return prev; }
            const newView: ProfileView = { viewer, timestamp: 'الآن' };
            const newViews = [newView, ...viewsForUser];
            return { ...prev, [user.name]: newViews };
        });
    }
    setViewedProfileUser(user);
    setCurrentPage('profile');
    setSearchQuery('');
  };

  const handleGoToMyProfile = () => {
    if (!users.currentUser) return;
    setViewedProfileUser(users.currentUser);
    setCurrentPage('profile');
    setSearchQuery('');
  };
  
  const handleGoHome = () => {
    setCurrentPage('home');
    setViewedProfileUser(null);
    setSearchQuery('');
  };

  const handleFollowToggle = (userName: string) => {
    setFollowing(prev => { const isFollowing = prev.includes(userName); if (isFollowing) { return prev.filter(name => name !== userName); } else { return [...prev, userName]; } });
  };
  
  const handleNotificationNavigate = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);
    handleViewProfile(notification.actor);
  };


  const userPosts = posts.filter(post => post.author.name === viewedProfileUser?.name);
  const lowercasedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = searchQuery ? posts.filter(post => post.text.toLowerCase().includes(lowercasedQuery) || post.author.name.toLowerCase().includes(lowercasedQuery)) : [];
  const filteredUsers = searchQuery ? (Object.values(users) as User[]).filter(user => user.name !== users.currentUser?.name && user.name.toLowerCase().includes(lowercasedQuery)) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!users.currentUser) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const renderMainContent = () => {
    if (searchQuery) {
      return <SearchResults users={filteredUsers} posts={filteredPosts} currentUser={users.currentUser} onViewProfile={handleViewProfile} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} query={searchQuery} following={following} onFollowToggle={handleFollowToggle} />;
    }
    if (currentPage === 'profile' && viewedProfileUser) {
        return <ProfilePage user={viewedProfileUser} posts={userPosts} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onAddPost={handleAddPost} currentUser={users.currentUser} onViewProfile={handleViewProfile} onEditProfile={() => setIsEditModalOpen(true)} following={following} onFollowToggle={handleFollowToggle} viewers={profileViews[viewedProfileUser.name]} />
    }
    return (
        <>
            <CreatePost onAddPost={handleAddPost} currentUser={users.currentUser} />
            <div className="mt-8">
              {posts.map((post) => ( <PostCard key={post.id} post={post} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} currentUser={users.currentUser} onViewProfile={handleViewProfile} /> ))}
            </div>
        </>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto py-3 px-4 flex justify-start sm:justify-between items-center gap-2 sm:gap-4 relative">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 shrink-0">Maydan</h1>
          <div className="relative flex-grow max-w-xl sm:mx-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </span>
            <input
                ref={searchInputRef}
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="مسح البحث">
                    <XCircleIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse" ref={notificationButtonRef}>
            <div className="hidden lg:flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
                <button onClick={handleGoHome} aria-label="الرئيسية" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <HomeIcon className={`w-7 h-7 ${currentPage === 'home' && !searchQuery ? 'text-indigo-600' : 'text-slate-500'}`} />
                </button>
                <button onClick={handleGoToMyProfile} aria-label="الملف الشخصي" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <UserIcon className={`w-7 h-7 ${currentPage === 'profile' && viewedProfileUser?.name === users.currentUser.name ? 'text-indigo-600' : 'text-slate-500'}`} />
                </button>
            </div>
            <div className="hidden lg:block">
                 <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} aria-label="الإشعارات" className="p-2 rounded-full hover:bg-slate-100 transition-colors relative">
                    <BellIcon className="w-7 h-7 text-slate-500" />
                    {unreadCount > 0 && ( <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span> )}
                </button>
            </div>
          </div>
          <div ref={notificationsRef}>
            {isNotificationsOpen && ( <Notifications notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNavigate={handleNotificationNavigate} /> )}
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto p-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 lg:pb-4">
        <main className="lg:col-span-2">
            {renderMainContent()}
        </main>
        <aside className="hidden lg:block sticky top-24 h-fit">
            <Sidebar currentUser={users.currentUser} allUsers={Object.values(users) as User[]} following={following} onViewProfile={handleViewProfile} onFollowToggle={handleFollowToggle} />
        </aside>
      </div>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={users.currentUser} onSave={handleUpdateProfile} />
      <BottomNavBar
        currentPage={currentPage}
        searchQuery={searchQuery}
        viewedProfileUser={viewedProfileUser}
        currentUser={users.currentUser}
        unreadCount={unreadCount}
        onHomeClick={handleGoHome}
        onProfileClick={handleGoToMyProfile}
        onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onSearchClick={() => searchInputRef.current?.focus()}
      />
    </div>
  );
};

export default App;
