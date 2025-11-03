import React, { useState, useEffect, useRef, useMemo } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import ProfilePage from './components/ProfilePage';
import EditProfileModal from './components/EditProfileModal';
import SettingsModal from './components/SettingsModal';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import BottomNavBar from './components/BottomNavBar';
import ChatPage from './components/ChatPage';
import StoriesTray from './components/StoriesTray';
import StoryCreatorModal from './components/StoryCreatorModal';
import StoryViewer from './components/StoryViewer';
import ShortsPage from './components/ShortsPage';
import CreateReelModal from './components/CreateReelModal';
import { Post, User, Notification, Message, Story, Reel } from './types';
import { initialUsers, initialPosts, initialProfileViews, initialNotifications, initialMessages, initialStories, initialReels } from './data';
import { HomeIcon, UserIcon, SearchIcon, XCircleIcon, BellIcon, ChatBubbleLeftRightIcon, VideoCameraIcon } from './components/Icons';

type ProfileView = { viewer: User; timestamp: string };
type Page = 'home' | 'profile' | 'chat' | 'shorts';

const App: React.FC = () => {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<string[]>(['sara']);
  const [profileViews, setProfileViews] = useState<Record<string, ProfileView[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isReelCreatorOpen, setIsReelCreatorOpen] = useState(false);
  const [viewingStoryUserKey, setViewingStoryUserKey] = useState<string | null>(null);


  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsers(initialUsers);
    setPosts(initialPosts);
    setReels(initialReels);
    setProfileViews(initialProfileViews);
    setNotifications(initialNotifications);
    setMessages(initialMessages);
    setStories(initialStories);
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

  const handleLikeReel = (reelId: number) => {
    setReels( reels.map((reel) => { if (reel.id === reelId) { const isLiked = !reel.isLiked; return { ...reel, isLiked: isLiked, likes: isLiked ? reel.likes + 1 : reel.likes - 1, }; } return reel; }) );
  };

  const handleShareReel = (reelId: number) => {
    setReels( reels.map((reel) => { if (reel.id === reelId) { return { ...reel, shares: reel.shares + 1 }; } return reel; }) );
  };

  const handleAddReelComment = (reelId: number, text: string) => {
    if (!users.currentUser) return;
    setReels( reels.map((reel) => { if (reel.id === reelId) { const newComment = { id: Date.now(), author: users.currentUser, text, }; return { ...reel, comments: [...reel.comments, newComment] }; } return reel; }) );
  };

  const handleAddReel = (videoUrl: string, caption: string) => {
    if (!users.currentUser) return;
    const newReel: Reel = {
      id: Date.now(),
      author: users.currentUser,
      videoUrl,
      caption,
      likes: 0,
      shares: 0,
      isLiked: false,
      timestamp: 'الآن',
      comments: [],
      music: 'Original Audio'
    };
    setReels(prev => [newReel, ...prev]);
  };


  const handleUpdateProfile = (updatedUser: User) => {
    const oldUser = users.currentUser;
    if (!oldUser) return;
    setUsers(prevUsers => ({ ...prevUsers, currentUser: updatedUser }));
    if (viewedProfileUser && viewedProfileUser.name === oldUser.name) { setViewedProfileUser(updatedUser); }
    setPosts(prevPosts => prevPosts.map(post => { const updatedPost = { ...post }; if (post.author.name === oldUser.name) { updatedPost.author = updatedUser; } updatedPost.comments = post.comments.map(comment => { if (comment.author.name === oldUser.name) { return { ...comment, author: updatedUser }; } return comment; }); return updatedPost; }));
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (!users.currentUser) return;
    const updatedUser = { ...users.currentUser, avatarUrl: newAvatarUrl };
    handleUpdateProfile(updatedUser);
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
  
  const handleGoToChat = (user?: User) => {
    setCurrentPage('chat');
    setViewedProfileUser(null);
    setSearchQuery('');
    setChatTargetUser(user || null);
  };
  
  const handleGoToShorts = () => {
    setCurrentPage('shorts');
    setViewedProfileUser(null);
    setSearchQuery('');
  };

  const handleSendMessage = (recipient: User, text: string) => {
    if (!users.currentUser) return;
    
    const recipientKey = Object.keys(users).find(key => users[key].name === recipient.name);
    if (!recipientKey) return;

    const newMessage: Message = {
      id: Date.now(),
      senderKey: 'currentUser',
      receiverKey: recipientKey,
      text,
      timestamp: 'الآن',
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate a reply and create a notification
    setTimeout(() => {
        const replyMessage: Message = {
            id: Date.now() + 1,
            senderKey: recipientKey,
            receiverKey: 'currentUser',
            text: 'شكراً لك! سألقي نظرة على ذلك.',
            timestamp: 'الآن',
        };
        setMessages(prev => [...prev, replyMessage]);

        const newNotification: Notification = {
            id: Date.now() + 2,
            type: 'message',
            actor: recipient,
            read: false,
            timestamp: 'الآن',
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, 1500);
  };

  const handleFollowToggle = (userName: string) => {
    setFollowing(prev => { const isFollowing = prev.includes(userName); if (isFollowing) { return prev.filter(name => name !== userName); } else { return [...prev, userName]; } });
  };
  
  const handleNotificationNavigate = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);
    if (notification.type === 'message') {
        handleGoToChat(notification.actor);
    } else {
        handleViewProfile(notification.actor);
    }
  };

  const handleAddStory = (storyData: { type: 'image' | 'text'; content: string; caption?: string; backgroundColor?: string; }) => {
    const newStory: Story = {
      id: Date.now(),
      authorKey: 'currentUser',
      timestamp: new Date(),
      viewedBy: [],
      ...storyData
    };
    setStories(prev => [newStory, ...prev]);
  };

  const handleViewStories = (userName: string) => {
      const userKey = Object.keys(users).find(key => users[key].name === userName)
      if (userKey) {
          setViewingStoryUserKey(userKey);
      }
  };

  const handleMarkStoryAsViewed = (storyId: number) => {
      setStories(prevStories => prevStories.map(story => {
          if (story.id === storyId && !story.viewedBy.includes('currentUser')) {
              return { ...story, viewedBy: [...story.viewedBy, 'currentUser'] };
          }
          return story;
      }));
  };

  const userPosts = posts.filter(post => post.author.name === viewedProfileUser?.name);
  const userReels = reels.filter(reel => reel.author.name === viewedProfileUser?.name);
  const lowercasedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = searchQuery ? posts.filter(post => post.text.toLowerCase().includes(lowercasedQuery) || post.author.name.toLowerCase().includes(lowercasedQuery)) : [];
  const filteredUsers = searchQuery ? (Object.values(users) as User[]).filter(user => user.name !== users.currentUser?.name && user.name.toLowerCase().includes(lowercasedQuery)) : [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const followingUsers = following.map(key => users[key]).filter(Boolean);

  const activeStories = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return stories.filter(story => story.timestamp > twentyFourHoursAgo);
  }, [stories]);

  const storyGroups = useMemo(() => {
      const groups: Record<string, { user: User; stories: Story[]; hasUnviewed: boolean }> = {};
      
      for (const story of activeStories) {
          if (story.authorKey === 'currentUser') continue;

          if (!groups[story.authorKey]) {
              groups[story.authorKey] = {
                  user: users[story.authorKey],
                  stories: [],
                  hasUnviewed: false,
              };
          }
          groups[story.authorKey].stories.push(story);
          if (!story.viewedBy.includes('currentUser')) {
              groups[story.authorKey].hasUnviewed = true;
          }
      }
      return Object.values(groups).filter(g => g.user);
  }, [activeStories, users]);
  
  const viewingUserStories = viewingStoryUserKey ? activeStories.filter(s => s.authorKey === viewingStoryUserKey) : [];

  const handleStoryNavigation = (direction: 'next' | 'prev') => {
      const userKeysWithStories = storyGroups.map(g => Object.keys(users).find(key => users[key].name === g.user.name)).filter(Boolean) as string[];
      if (!viewingStoryUserKey) return;
      const currentIndex = userKeysWithStories.indexOf(viewingStoryUserKey);
      
      let nextIndex;
      if (direction === 'next') {
          nextIndex = currentIndex + 1;
          if (nextIndex >= userKeysWithStories.length) {
              setViewingStoryUserKey(null); // Close viewer
              return;
          }
      } else {
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
              setViewingStoryUserKey(null); // Close viewer
              return;
          }
      }
      setViewingStoryUserKey(userKeysWithStories[nextIndex]);
  };


  if (!users.currentUser) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const renderMainContent = () => {
    if (searchQuery) {
      return <SearchResults users={filteredUsers} posts={filteredPosts} currentUser={users.currentUser} onViewProfile={handleViewProfile} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} query={searchQuery} following={following} onFollowToggle={handleFollowToggle} />;
    }
    switch (currentPage) {
        case 'profile':
            if (viewedProfileUser) {
                return <ProfilePage user={viewedProfileUser} posts={userPosts} reels={userReels} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onAddPost={handleAddPost} currentUser={users.currentUser} onViewProfile={handleViewProfile} onEditProfile={() => setIsEditModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} onGoToChat={handleGoToChat} following={following} onFollowToggle={handleFollowToggle} viewers={profileViews[viewedProfileUser.name]} onUpdateAvatar={handleUpdateAvatar} />
            }
            return null;
        case 'chat':
            return <ChatPage currentUser={users.currentUser} allUsers={users} messages={messages} onSendMessage={handleSendMessage} followingUsers={followingUsers} initialTargetUser={chatTargetUser} onClearTargetUser={() => setChatTargetUser(null)} onViewProfile={handleViewProfile} />;
        case 'shorts':
            return <ShortsPage reels={reels} currentUser={users.currentUser} onLike={handleLikeReel} onAddComment={handleAddReelComment} onShare={handleShareReel} onAddReel={() => setIsReelCreatorOpen(true)} onViewProfile={handleViewProfile} />;
        case 'home':
        default:
            return (
                <>
                    <StoriesTray
                      storyGroups={storyGroups}
                      currentUser={users.currentUser}
                      onViewStories={(userName) => handleViewStories(userName)}
                      onAddStory={() => setIsStoryCreatorOpen(true)}
                    />
                    <CreatePost onAddPost={handleAddPost} currentUser={users.currentUser} />
                    <div className="mt-8">
                      {posts.map((post) => ( <PostCard key={post.id} post={post} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} currentUser={users.currentUser} onViewProfile={handleViewProfile} /> ))}
                    </div>
                </>
            );
    }
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
                <button onClick={handleGoToShorts} aria-label="فيديوهات" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <VideoCameraIcon className={`w-7 h-7 ${currentPage === 'shorts' ? 'text-indigo-600' : 'text-slate-500'}`} />
                </button>
                <button onClick={() => handleGoToChat()} aria-label="الدردشات" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <ChatBubbleLeftRightIcon className={`w-7 h-7 ${currentPage === 'chat' ? 'text-indigo-600' : 'text-slate-500'}`} />
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
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
       <StoryCreatorModal 
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        onAddStory={handleAddStory}
      />
      <CreateReelModal
        isOpen={isReelCreatorOpen}
        onClose={() => setIsReelCreatorOpen(false)}
        onAddReel={handleAddReel}
      />
      {viewingStoryUserKey && viewingUserStories.length > 0 && (
        <StoryViewer
          user={users[viewingStoryUserKey]}
          stories={viewingUserStories}
          onClose={() => setViewingStoryUserKey(null)}
          onNextUser={() => handleStoryNavigation('next')}
          onPrevUser={() => handleStoryNavigation('prev')}
          onMarkAsViewed={handleMarkStoryAsViewed}
        />
      )}
      <BottomNavBar
        currentPage={currentPage}
        searchQuery={searchQuery}
        viewedProfileUser={viewedProfileUser}
        currentUser={users.currentUser}
        unreadCount={unreadCount}
        onHomeClick={handleGoHome}
        onProfileClick={handleGoToMyProfile}
        onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onShortsClick={handleGoToShorts}
        onChatClick={() => handleGoToChat()}
      />
    </div>
  );
};

export default App;