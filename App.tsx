

import React, { useState, useEffect, useRef, useMemo } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import ProfilePage from './components/ProfilePage';
import EditProfileModal from './components/EditProfileModal';
import EditPostModal from './components/EditPostModal';
import SettingsModal from './components/SettingsModal';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Notifications from './components/Notifications';
import BottomNavBar from './components/BottomNavBar';
import ChatPage from './components/ChatPage';
import StoriesTray from './components/StoriesTray';
import StoryCreatorModal from './components/StoryCreatorModal';
import StoryViewer from './components/StoryViewer';
import ShortsPage from './components/ShortsPage';
import CreateReelModal from './components/CreateReelModal';
import AuthPage from './components/AuthPage';
import { useAuth } from './contexts/AuthContext';
import { Post, User, Notification, Message, Story, Reel } from './types';
import { initialUsers, initialPosts, initialProfileViews, initialNotifications, initialMessages, initialStories, initialReels } from './data';
import { HomeIcon, UserIcon, SearchIcon, XCircleIcon, BellIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, XIcon, TrashIcon } from './components/Icons';
import { loadState, saveState } from './services/storageService';

type ProfileView = { viewer: User; timestamp: string };
type Page = 'home' | 'profile' | 'chat' | 'shorts';

// --- Confirmation Modal Component ---
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'حذف', cancelText = 'إلغاء' }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-800" id="modal-title">{title}</h2>
          </div>
          <button onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <div className="mt-6 flex justify-end items-center space-x-2 rtl:space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { currentUser: authUser, loading: authLoading, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<Record<string, User>>(() => loadState('maydan_users', initialUsers));
  const [posts, setPosts] = useState<Post[]>(() => loadState('maydan_posts', initialPosts));
  const [reels, setReels] = useState<Reel[]>(() => loadState('maydan_reels', initialReels));
  const [stories, setStories] = useState<Story[]>(() => loadState('maydan_stories', initialStories));
  const [profileViews, setProfileViews] = useState<Record<string, ProfileView[]>>(() => loadState('maydan_profileViews', initialProfileViews));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('maydan_notifications', initialNotifications));
  const [messages, setMessages] = useState<Message[]>(() => loadState('maydan_messages', initialMessages));
  const [following, setFollowing] = useState<string[]>(() => loadState('maydan_following', ['user1', 'user2', 'user3', 'user4', 'user5']));
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mainViewTab, setMainViewTab] = useState<'posts' | 'shorts'>('posts');
  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);
  const [desktopChatUser, setDesktopChatUser] = useState<User | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isReelCreatorOpen, setIsReelCreatorOpen] = useState(false);
  const [viewingStoryUserKey, setViewingStoryUserKey] = useState<string | null>(null);


  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveState('maydan_users', users); }, [users]);
  useEffect(() => { saveState('maydan_posts', posts); }, [posts]);
  useEffect(() => { saveState('maydan_reels', reels); }, [reels]);
  useEffect(() => { saveState('maydan_stories', stories); }, [stories]);
  useEffect(() => { saveState('maydan_profileViews', profileViews); }, [profileViews]);
  useEffect(() => { saveState('maydan_notifications', notifications); }, [notifications]);
  useEffect(() => { saveState('maydan_messages', messages); }, [messages]);
  useEffect(() => { saveState('maydan_following', following); }, [following]);

  useEffect(() => {
    if (authUser) {
      // In a real app, you would fetch the user's profile from Firestore here.
      // For now, we'll create a profile based on the auth user's info.
      const existingUser = users[authUser.uid];
      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
         const userProfile: User = {
          uid: authUser.uid,
          name: authUser.displayName || authUser.email?.split('@')[0] || 'مستخدم جديد',
          avatarUrl: authUser.photoURL || `https://picsum.photos/seed/${authUser.uid}/100/100`,
          bio: 'مرحباً! أنا أستخدم هذا التطبيق الرائع.',
          country: { value: 'السعودية', isPublic: true },
          gender: { value: 'أفضل عدم القول', isPublic: true },
          isOnline: true,
        };
        setCurrentUser(userProfile);
      }
    } else {
      setCurrentUser(null);
    }
  }, [authUser, users]);

  useEffect(() => {
    if (currentUser) {
        setUsers(prevUsers => ({
            ...prevUsers,
            [currentUser.uid]: currentUser
        }));
    }
  }, [currentUser]);
  
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
    if (!currentUser) return;
    const newPost: Post = { id: Date.now(), author: currentUser, text, imageUrl, likes: 0, shares: 0, isLiked: false, isSaved: false, timestamp: "الآن", comments: [], };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: number) => {
    setPosts( posts.map((post) => { if (post.id === postId) { const isLiked = !post.isLiked; return { ...post, isLiked: isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1, }; } return post; }) );
  };

  const handleSavePost = (postId: number) => {
    setPosts(
        posts.map((post) => {
            if (post.id === postId) {
                return { ...post, isSaved: !post.isSaved };
            }
            return post;
        })
    );
  };

  const handleSharePost = (postId: number) => {
    setPosts( posts.map((post) => { if (post.id === postId) { return { ...post, shares: post.shares + 1 }; } return post; }) );
  };

  const handleAddComment = (postId: number, text: string) => {
    if (!currentUser) return;
    setPosts( posts.map((post) => { if (post.id === postId) { const newComment = { id: Date.now(), author: currentUser, text, }; return { ...post, comments: [...post.comments, newComment] }; } return post; }) );
  };
  
  const handleOpenEditPostModal = (post: Post) => {
    setEditingPost(post);
  };

  const handleCloseEditPostModal = () => {
      setEditingPost(null);
  };

  const handleEditPost = (postId: number, newText: string) => {
      setPosts(posts.map(p => (p.id === postId ? { ...p, text: newText } : p)));
      handleCloseEditPostModal();
  };

  const handleDeletePost = (postId: number) => {
    setPostIdToDelete(postId);
  };

  const confirmDeletePost = () => {
    if (postIdToDelete !== null) {
      setPosts(posts.filter(p => p.id !== postIdToDelete));
      setPostIdToDelete(null);
    }
  };

  const handleLikeReel = (reelId: number) => {
    setReels( reels.map((reel) => { if (reel.id === reelId) { const isLiked = !reel.isLiked; return { ...reel, isLiked: isLiked, likes: isLiked ? reel.likes + 1 : reel.likes - 1, }; } return reel; }) );
  };

  const handleShareReel = (reelId: number) => {
    setReels( reels.map((reel) => { if (reel.id === reelId) { return { ...reel, shares: reel.shares + 1 }; } return reel; }) );
  };

  const handleAddReelComment = (reelId: number, text: string) => {
    if (!currentUser) return;
    setReels( reels.map((reel) => { if (reel.id === reelId) { const newComment = { id: Date.now(), author: currentUser, text, }; return { ...reel, comments: [...reel.comments, newComment] }; } return reel; }) );
  };

  const handleAddReel = (videoUrl: string, caption: string) => {
    if (!currentUser) return;
    const newReel: Reel = {
      id: Date.now(),
      author: currentUser,
      videoUrl,
      caption,
      likes: 0,
      shares: 0,
      isLiked: false,
      timestamp: "الآن",
      comments: [],
      music: 'Original Audio'
    };
    setReels(prev => [newReel, ...prev]);
  };


  const handleUpdateProfile = (updatedUser: User) => {
    const oldUser = currentUser;
    if (!oldUser) return;
    
    setCurrentUser(updatedUser);

    if (viewedProfileUser && viewedProfileUser.uid === oldUser.uid) { setViewedProfileUser(updatedUser); }
    setPosts(prevPosts => prevPosts.map(post => { const updatedPost = { ...post }; if (post.author.uid === oldUser.uid) { updatedPost.author = updatedUser; } updatedPost.comments = post.comments.map(comment => { if (comment.author.uid === oldUser.uid) { return { ...comment, author: updatedUser }; } return comment; }); return updatedPost; }));
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
    handleUpdateProfile(updatedUser);
  };

  const handleViewProfile = (user: User) => {
    if (currentUser && user.uid !== currentUser.uid) {
        const viewer = currentUser;
        setProfileViews(prev => {
            const viewsForUser = prev[user.uid] || [];
            // Check if the current user is already the last viewer
            if (viewsForUser.length > 0 && viewsForUser[0].viewer.uid === viewer.uid) {
                return prev; // Don't add if they are the last viewer
            }
            const newView: ProfileView = { viewer, timestamp: "الآن" };
            return { ...prev, [user.uid]: [newView, ...viewsForUser] };
        });
    }
    setViewedProfileUser(user);
    setCurrentPage('profile');
    setSearchQuery('');
  };

  const handleGoToMyProfile = () => {
    if (!currentUser) return;
    setViewedProfileUser(currentUser);
    setCurrentPage('profile');
    setSearchQuery('');
  };
  
  const handleGoHome = () => {
    setCurrentPage('home');
    setMainViewTab('posts');
    setViewedProfileUser(null);
    setSearchQuery('');
  };
  
  const handleGoToChat = (user?: User) => {
    // For desktop, set the target user for the sidebar. For mobile, change page.
    setDesktopChatUser(user || null);
    setCurrentPage('chat');
    setChatTargetUser(user || null);
    setViewedProfileUser(null);
    setSearchQuery('');
  };
  
  const handleGoToShorts = () => {
    setCurrentPage('home');
    setMainViewTab('shorts');
    setViewedProfileUser(null);
    setSearchQuery('');
  };

  const handleSendMessage = (recipient: User, text: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: Date.now(),
      senderKey: currentUser.uid,
      receiverKey: recipient.uid,
      text,
      timestamp: "الآن",
    };
    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
        const replyMessage: Message = {
            id: Date.now() + 1,
            senderKey: recipient.uid,
            receiverKey: currentUser.uid,
            text: 'شكراً لك! سألقي نظرة على ذلك.',
            timestamp: "الآن",
        };
        setMessages(prev => [...prev, replyMessage]);

        const newNotification: Notification = {
            id: Date.now() + 2,
            type: 'message',
            actor: recipient,
            read: false,
            timestamp: "الآن",
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, 1500);
  };

  const handleFollowToggle = (userUid: string) => {
    setFollowing(prev => { const isFollowing = prev.includes(userUid); if (isFollowing) { return prev.filter(uid => uid !== userUid); } else { return [...prev, userUid]; } });
  };
  
  const handleNotificationNavigate = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setIsNotificationsOpen(false);

    switch(notification.type) {
        case 'follow':
            handleViewProfile(notification.actor);
            break;
        case 'message':
            handleGoToChat(notification.actor);
            break;
        case 'like':
        case 'comment':
            handleGoHome();
            break;
    }
  };

  const handleAddStory = (storyData: { type: 'image' | 'text'; content: string; caption?: string; backgroundColor?: string; }) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: Date.now(),
      authorKey: currentUser.uid,
      ...storyData,
      timestamp: new Date(),
      viewedBy: [],
    };
    setStories(prev => [newStory, ...prev]);
  };

  const handleMarkStoryAsViewed = (storyId: number) => {
    if (!currentUser) return;
    setStories(prev => prev.map(story => {
      if (story.id === storyId && !story.viewedBy.includes(currentUser.uid)) {
        return { ...story, viewedBy: [...story.viewedBy, currentUser.uid] };
      }
      return story;
    }));
  };
  
  const handleViewStories = (userUid: string) => {
    setViewingStoryUserKey(userUid);
  };
  
  const storyUsers = useMemo(() => {
    const userKeysWithStories = [...new Set(stories.map(s => s.authorKey))];
    return userKeysWithStories
      .map(key => users[key])
      .filter((user): user is User => Boolean(user));
  }, [stories, users]);

  const storyGroups = useMemo(() => {
    if (!currentUser) return [];
    return storyUsers.map(user => {
      const userStories = stories.filter(s => s.authorKey === user.uid);
      const hasUnviewed = userStories.some(s => !s.viewedBy.includes(currentUser.uid));
      return { user, hasUnviewed };
    });
  }, [storyUsers, stories, currentUser]);

  const viewingStoryUser = viewingStoryUserKey ? users[viewingStoryUserKey] : null;
  const storiesForViewer = viewingStoryUser ? stories.filter(s => s.authorKey === viewingStoryUser.uid) : [];
  
  const getNextStoryUserKey = () => {
    if (!viewingStoryUserKey) return;
    const currentIndex = storyUsers.findIndex(u => u.uid === viewingStoryUserKey);
    if (currentIndex > -1 && currentIndex < storyUsers.length - 1) {
      setViewingStoryUserKey(storyUsers[currentIndex + 1].uid);
    } else {
      setViewingStoryUserKey(null); // Close viewer if it's the last user
    }
  };
  
  const getPrevStoryUserKey = () => {
    if (!viewingStoryUserKey) return;
    const currentIndex = storyUsers.findIndex(u => u.uid === viewingStoryUserKey);
    if (currentIndex > 0) {
      setViewingStoryUserKey(storyUsers[currentIndex - 1].uid);
    } else {
      setViewingStoryUserKey(null); // Close viewer if it's the first user
    }
  };


  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { users: [], posts: [] };
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const validUsers: User[] = Object.values(users).filter(
      // FIX: The `user` parameter might be `unknown` when loaded from localStorage.
      // Cast to `any` to safely access properties for this runtime check.
      (user: unknown): user is User => !!user && typeof (user as any).name === 'string' && typeof (user as any).uid === 'string'
    );

    const filteredUsers = validUsers.filter(user =>
      user.name.toLowerCase().includes(lowercasedQuery) && user.uid !== currentUser?.uid
    );
    const filteredPosts = posts.filter(post =>
      post.text.toLowerCase().includes(lowercasedQuery) ||
      post.author.name.toLowerCase().includes(lowercasedQuery)
    );
    return { users: filteredUsers, posts: filteredPosts };
  }, [searchQuery, users, posts, currentUser]);
  
  const followingUsers = useMemo(() => {
    return following.map(uid => users[uid]).filter((user): user is User => Boolean(user));
  }, [following, users]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;


  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="w-16 h-16 border-8 border-t-transparent border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth screen
  if (!authUser || !currentUser) {
    return <AuthPage />;
  }
  
  const homeFeedContent = (
      <>
        <StoriesTray
            storyGroups={storyGroups}
            currentUser={currentUser}
            onViewStories={handleViewStories}
            onAddStory={() => setIsStoryCreatorOpen(true)}
         />
        <CreatePost onAddPost={handleAddPost} currentUser={currentUser} />
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLikePost}
              onAddComment={handleAddComment}
              onShare={handleSharePost}
              onSave={handleSavePost}
              currentUser={currentUser}
              onViewProfile={handleViewProfile}
              onEdit={handleOpenEditPostModal}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      </>
  );

  const desktopHomeContent = (
      <>
        <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex justify-center space-x-8 rtl:space-x-reverse" aria-label="Tabs">
                    <button
                        onClick={() => { setCurrentPage('home'); setMainViewTab('posts'); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${mainViewTab === 'posts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>المنشورات</span>
                    </button>
                    <button
                         onClick={() => { setCurrentPage('home'); setMainViewTab('shorts'); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${mainViewTab === 'shorts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <VideoCameraIcon className="w-5 h-5" />
                        <span>الفيديوهات</span>
                    </button>
                </nav>
            </div>
        </div>
        
        {mainViewTab === 'posts' && homeFeedContent}

        {mainViewTab === 'shorts' && (
             <ShortsPage
                reels={reels}
                currentUser={currentUser}
                onLike={handleLikeReel}
                onAddComment={handleAddReelComment}
                onShare={handleShareReel}
                onAddReel={() => setIsReelCreatorOpen(true)}
                onViewProfile={handleViewProfile}
            />
        )}
      </>
  );

  // Main App
  const renderPage = () => {
    if (searchQuery.trim()) {
      return <SearchResults 
        users={searchResults.users} 
        posts={searchResults.posts} 
        currentUser={currentUser} 
        onViewProfile={handleViewProfile}
        onLike={handleLikePost}
        onAddComment={handleAddComment}
        onShare={handleSharePost}
        onSave={handleSavePost}
        onEdit={handleOpenEditPostModal}
        onDelete={handleDeletePost}
        query={searchQuery}
        following={following}
        onFollowToggle={handleFollowToggle}
      />
    }

    switch (currentPage) {
      case 'profile':
        const userToView = viewedProfileUser || currentUser;
        return <ProfilePage
          user={userToView}
          posts={posts.filter(p => p.author.uid === userToView.uid)}
          reels={reels.filter(r => r.author.uid === userToView.uid)}
          savedPosts={posts.filter(p => p.isSaved)}
          onLike={handleLikePost}
          onAddComment={handleAddComment}
          onShare={handleSharePost}
          onSave={handleSavePost}
          onAddPost={handleAddPost}
          currentUser={currentUser}
          onViewProfile={handleViewProfile}
          onEditProfile={() => setIsEditModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onGoToChat={handleGoToChat}
          following={following}
          onFollowToggle={handleFollowToggle}
          viewers={profileViews[userToView.uid]}
          onUpdateAvatar={handleUpdateAvatar}
          onEditPost={handleOpenEditPostModal}
          onDeletePost={handleDeletePost}
        />;
      case 'chat':
        // This is now primarily for mobile view
        return <ChatPage 
          currentUser={currentUser}
          allUsers={users}
          messages={messages}
          onSendMessage={handleSendMessage}
          followingUsers={followingUsers}
          initialTargetUser={chatTargetUser}
          onClearTargetUser={() => setChatTargetUser(null)}
          onViewProfile={handleViewProfile}
        />;
      case 'shorts':
        // This is for mobile view
        return <ShortsPage
            reels={reels}
            currentUser={currentUser}
            onLike={handleLikeReel}
            onAddComment={handleAddReelComment}
            onShare={handleShareReel}
            onAddReel={() => setIsReelCreatorOpen(true)}
            onViewProfile={handleViewProfile}
        />
      case 'home':
      default:
        return homeFeedContent;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-16 lg:pb-0">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 sm:gap-4">
            <button onClick={handleGoHome} className="shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">Maydan</h1>
            </button>
            
            <div className="relative w-full flex-1 max-w-lg">
                <input
                    type="text"
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm sm:text-base"
                />
                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                        <XCircleIcon className="w-5 h-5 text-slate-400 hover:text-slate-600"/>
                     </button>
                )}
            </div>
            
            <div className="flex items-center space-x-0 sm:space-x-2 rtl:space-x-reverse">
                <div ref={notificationButtonRef} className="relative">
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
                        <BellIcon className="w-6 h-6 text-slate-600"/>
                        {unreadNotificationsCount > 0 && (
                             <span className="absolute -top-0.5 -right-0.5 flex justify-center items-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                                {unreadNotificationsCount}
                            </span>
                        )}
                    </button>
                </div>
                <button onClick={handleGoToMyProfile} className="flex items-center space-x-2 rtl:space-x-reverse p-1 sm:pr-3 rounded-full hover:bg-slate-100 transition-colors hidden sm:flex">
                    <span className="font-semibold text-slate-700 text-sm hidden md:block">{currentUser.name}</span>
                    <img src={currentUser.avatarUrl} alt="ملف شخصي" className="w-9 h-9 rounded-full" />
                </button>
            </div>
        </div>
        {isNotificationsOpen && (
             <div ref={notificationsRef}>
                <Notifications notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNavigate={handleNotificationNavigate} />
            </div>
        )}
      </header>
      
      <div className="max-w-7xl mx-auto flex justify-center gap-8 px-4 py-6">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24">
            <Sidebar
                currentUser={currentUser}
                allUsers={Object.values(users).filter((user): user is User => !!user && !!user.uid)}
                following={following}
                onViewProfile={handleViewProfile}
                onFollowToggle={handleFollowToggle}
            />
          </div>
        </aside>

        <main className="w-full max-w-xl">
            <div className="lg:hidden">
                {renderPage()}
            </div>
            <div className="hidden lg:block">
                {searchQuery.trim() || currentPage === 'profile' ? renderPage() : desktopHomeContent}
            </div>
        </main>
        
        <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
                <RightSidebar
                    currentUser={currentUser}
                    allUsers={users}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    followingUsers={followingUsers}
                    onViewProfile={handleViewProfile}
                    initialTargetUser={desktopChatUser}
                    onClearTargetUser={() => setDesktopChatUser(null)}
                />
            </div>
        </aside>
      </div>
      
      <BottomNavBar 
        currentPage={currentPage} 
        searchQuery={searchQuery}
        viewedProfileUser={viewedProfileUser}
        currentUser={currentUser}
        unreadCount={unreadNotificationsCount}
        onHomeClick={handleGoHome}
        onShortsClick={() => setCurrentPage('shorts')}
        onNotificationsClick={() => setIsNotificationsOpen(p => !p)}
        onProfileClick={handleGoToMyProfile}
        onChatClick={() => setCurrentPage('chat')}
      />
      
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUser}
          onSave={handleUpdateProfile}
        />
      )}
      <EditPostModal
          isOpen={!!editingPost}
          onClose={handleCloseEditPostModal}
          post={editingPost}
          onSave={handleEditPost}
      />
      <ConfirmationModal
          isOpen={postIdToDelete !== null}
          onClose={() => setPostIdToDelete(null)}
          onConfirm={confirmDeletePost}
          title="تأكيد الحذف"
          message="هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
      />
      {isSettingsModalOpen && (
        <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onLogout={logout}
        />
      )}
       <StoryCreatorModal 
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        onAddStory={handleAddStory}
      />
       {viewingStoryUser && storiesForViewer.length > 0 && (
        <StoryViewer 
          user={viewingStoryUser}
          stories={storiesForViewer}
          onClose={() => setViewingStoryUserKey(null)}
          onNextUser={getNextStoryUserKey}
          onPrevUser={getPrevStoryUserKey}
          onMarkAsViewed={handleMarkStoryAsViewed}
        />
      )}
      <CreateReelModal
        isOpen={isReelCreatorOpen}
        onClose={() => setIsReelCreatorOpen(false)}
        onAddReel={handleAddReel}
      />

    </div>
  );
};

export default App;