import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Post, User, Comment, Reel, Story, Notification, Message } from './types';
import { initialUsers, initialPosts, initialComments, initialReels, initialStories, initialNotifications, initialMessages } from './data';
import { loadState, saveState } from './contexts/services/storageService';

// Statically import components that are part of the main, initial layout
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import BottomNavBar from './components/BottomNavBar';
import StoriesTray from './components/StoriesTray';

// Lazy-load components that are not immediately visible (pages, modals)
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const EditProfileModal = lazy(() => import('./components/EditProfileModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const EditPostModal = lazy(() => import('./components/EditPostModal'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const StoryViewer = lazy(() => import('./components/StoryViewer'));
const StoryCreatorModal = lazy(() => import('./components/StoryCreatorModal'));
const ShortsPage = lazy(() => import('./components/ShortsPage'));
const CreateReelModal = lazy(() => import('./components/CreateReelModal'));
const ChatPage = lazy(() => import('./components/ChatPage'));


const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
    </div>
);

const ContentLoader: React.FC = () => (
    <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
    </div>
);


export const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState<Record<string, User>>(() => loadState('maydan_users', initialUsers));
    const currentUser = users['user1']; // Get the current user from the reactive state
    const [posts, setPosts] = useState<Post[]>(() => loadState('maydan_posts', initialPosts));
    const [comments, setComments] = useState<Record<number, Comment[]>>(() => loadState('maydan_comments', initialComments));
    const [reels, setReels] = useState<Reel[]>(() => loadState('maydan_reels', initialReels));
    const [stories, setStories] = useState<Record<string, Story[]>>(() => loadState('maydan_stories', initialStories));
    const [notifications, setNotifications] = useState<Notification[]>(() => loadState('maydan_notifications', initialNotifications));
    const [messages, setMessages] = useState<Message[]>(() => loadState('maydan_messages', initialMessages));
    const [following, setFollowing] = useState<string[]>(() => loadState('maydan_following', ['user2', 'user4']));

    // Page and navigation state
    type Page = 'home' | 'profile' | 'chat' | 'shorts';
    const [page, setPage] = useState<Page>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewedProfileUid, setViewedProfileUid] = useState<string | null>(null);
    const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);

    // Modal states
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
    const [isCreateReelModalOpen, setIsCreateReelModalOpen] = useState(false);

    // Story viewer state
    const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<User | null>(null);
    const storyUsers = useMemo(() => Object.keys(stories).map(uid => users[uid]).filter(Boolean), [stories, users]);

    const filteredPosts = useMemo(() => posts.filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.name.toLowerCase().includes(searchQuery.toLowerCase())), [posts, searchQuery]);
    const filteredUsers = useMemo(() => {
        return (Object.values(users) as User[]).filter(u => u.uid !== currentUser.uid && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery, currentUser]);
    const allUsersList = useMemo(() => (Object.values(users) as User[]), [users]);
    const followingUsers = useMemo(() => following.map(uid => users[uid]).filter(Boolean), [following, users]);

    // Persist state to localStorage on change
    useEffect(() => { saveState('maydan_users', users); }, [users]);
    useEffect(() => { saveState('maydan_posts', posts); }, [posts]);
    useEffect(() => { saveState('maydan_comments', comments); }, [comments]);
    useEffect(() => { saveState('maydan_reels', reels); }, [reels]);
    useEffect(() => { saveState('maydan_stories', stories); }, [stories]);
    useEffect(() => { saveState('maydan_notifications', notifications); }, [notifications]);
    useEffect(() => { saveState('maydan_messages', messages); }, [messages]);
    useEffect(() => { saveState('maydan_following', following); }, [following]);
    
    // --- HANDLER FUNCTIONS ---
    // Navigation
    const handleViewProfile = (user: User) => {
        setViewedProfileUid(user.uid);
        setPage('profile');
        setSearchQuery('');
    };

    const navigateTo = (targetPage: Page) => {
        setPage(targetPage);
        setViewedProfileUid(null);
        setSearchQuery('');
    };
    
    const handleNotificationNavigate = (notification: Notification) => {
        setNotifications(current => current.map(n => n.id === notification.id ? {...n, read: true} : n));
        switch(notification.type) {
            case 'follow':
            case 'message':
                handleViewProfile(notification.actor);
                break;
            case 'like':
            case 'comment':
                navigateTo('home');
                break;
        }
    };

    // Post Interactions
    const handleAddPost = (text: string, media?: { url: string; type: 'image' | 'video' }) => {
        const newPost: Post = { 
            id: Date.now(), 
            author: currentUser, 
            text, 
            imageUrl: media?.type === 'image' ? media.url : undefined, 
            videoUrl: media?.type === 'video' ? media.url : undefined, 
            likes: 0, 
            comments: 0,
            shares: 0, 
            timestamp: new Date(), 
            isLiked: false, 
            isSaved: false 
        };
        setPosts([newPost, ...posts]);

        // If it's a video, also create a Reel so it appears in the Shorts feed
        if (media?.type === 'video' && media.url) {
            const newReel: Reel = {
                id: Date.now() + 1, // Use a slightly different ID to avoid potential key conflicts
                author: currentUser,
                videoUrl: media.url,
                caption: text,
                likes: 0,
                shares: 0,
                isLiked: false,
                comments: []
            };
            setReels([newReel, ...reels]);
        }
    };
    const handleLikePost = (postId: number) => setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    const handleSavePost = (postId: number) => setPosts(posts.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p));
    const handleAddComment = (postId: number, text: string) => {
        const newComment: Comment = { id: Date.now(), author: currentUser, text };
        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
    };
    const handleSharePost = async (postId: number) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            const shareUrl = window.location.origin;
            try {
                if (navigator.share) {
                    await navigator.share({ title: `منشور من ${post.author.name}`, text: post.text, url: shareUrl });
                    // On successful share (if not cancelled), increment the count
                    setPosts(posts.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
                } else {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('تم نسخ رابط المنشور.');
                    setPosts(posts.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
                }
            } catch (error) {
                console.log("Share failed or was cancelled", error);
            }
        }
    };
    const handleOpenEditPostModal = (post: Post) => { setEditingPost(post); setIsEditPostModalOpen(true); };
    const handleEditPost = (postId: number, newText: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, text: newText } : p));
        setIsEditPostModalOpen(false);
        setEditingPost(null);
    };
    const handleDeletePost = (postId: number) => setPosts(posts.filter(p => p.id !== postId));

    // User & Profile Interactions
    const handleUpdateUser = (updatedUser: User) => setUsers(prev => ({...prev, [updatedUser.uid]: updatedUser }));
    const handleFollowToggle = (userUid: string) => {
        setFollowing(prev => 
            prev.includes(userUid) 
                ? prev.filter(id => id !== userUid) 
                : [...prev, userUid]
        );
    };
    
    // Story Interactions
    const handleAddStory = (storyData: { type: 'image' | 'text'; content: string; caption?: string; backgroundColor?: string; }) => {
        const newStory: Story = { id: Date.now(), timestamp: new Date(), ...storyData };
        setStories(prev => ({ ...prev, [currentUser.uid]: [...(prev[currentUser.uid] || []), newStory] }));
    };
    const handleViewStories = (userUid: string) => setViewingStoriesOfUser(users[userUid]);
    const handleMarkStoryAsViewed = (storyId: number) => {};
    
    // Reel Interactions
    const handleAddReel = (videoUrl: string, caption: string) => {
        const newReel: Reel = { id: Date.now(), author: currentUser, videoUrl, caption, likes: 0, shares: 0, isLiked: false, comments: [] };
        setReels([newReel, ...reels]);
    };
    const handleLikeReel = (reelId: number) => setReels(reels.map(r => r.id === reelId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r));
    const handleShareReel = (reelId: number) => setReels(reels.map(r => r.id === reelId ? { ...r, shares: r.shares + 1 } : r));
    const handleAddReelComment = (reelId: number, text: string) => {
        const newComment: Comment = { id: Date.now(), author: currentUser, text };
        setReels(reels.map(r => r.id === reelId ? { ...r, comments: [...r.comments, newComment] } : r));
    };

    // Chat Interactions
    const handleSendMessage = (recipient: User, text: string) => {
        const newMessage: Message = { id: Date.now(), senderKey: currentUser.uid, receiverKey: recipient.uid, text, timestamp: new Date() };
        setMessages(prev => [...prev, newMessage]);
    };

    // --- RENDER LOGIC ---
    const renderMainContent = () => {
        if (searchQuery) {
            return <SearchResults users={filteredUsers} posts={filteredPosts} comments={comments} currentUser={currentUser} onViewProfile={handleViewProfile} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onSave={handleSavePost} onEdit={handleOpenEditPostModal} onDelete={handleDeletePost} query={searchQuery} following={following} onFollowToggle={handleFollowToggle} />;
        }
        if (page === 'profile') {
            if (!viewedProfileUid) {
                 return <div className="text-center p-8">لم يتم تحديد ملف شخصي.</div>;
            }
            const viewedProfileUser = users[viewedProfileUid];
            if (!viewedProfileUser) {
                return <div className="text-center p-8">المستخدم غير موجود.</div>;
            }
            const userPosts = posts.filter(p => p.author.uid === viewedProfileUser.uid);
            const userReels = reels.filter(r => r.author.uid === viewedProfileUser.uid);
            const savedPosts = posts.filter(p => p.isSaved);
            return <ProfilePage user={viewedProfileUser} posts={userPosts} reels={userReels} savedPosts={savedPosts} comments={comments} onLike={handleLikePost} onSave={handleSavePost} onAddComment={handleAddComment} onShare={handleSharePost} onAddPost={handleAddPost} currentUser={currentUser} handleViewProfile={handleViewProfile} onEditProfile={() => setIsEditProfileModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} onGoToChat={(user) => { setPage('chat'); setChatTargetUser(user); }} following={following} onFollowToggle={handleFollowToggle} viewers={[{viewer: users['user2'], timestamp: 'منذ 5 دقائق'}]} onEditPost={handleOpenEditPostModal} onDeletePost={handleDeletePost} />;
        }
        if (page === 'shorts') {
            return <ShortsPage reels={reels} currentUser={currentUser} onLike={handleLikeReel} onAddComment={handleAddReelComment} onShare={handleShareReel} onAddReel={() => setIsCreateReelModalOpen(true)} onViewProfile={handleViewProfile} />;
        }
        if (page === 'chat') {
            return <ChatPage currentUser={currentUser} allUsers={users} messages={messages} onSendMessage={handleSendMessage} followingUsers={followingUsers} initialTargetUser={chatTargetUser} onClearTargetUser={() => setChatTargetUser(null)} onViewProfile={handleViewProfile} />;
        }
        // Home page content
        return (
            <>
                <StoriesTray storyGroups={storyUsers.map(u => ({user: u, hasUnviewed: true}))} currentUser={currentUser} onViewStories={handleViewStories} onAddStory={() => setIsCreateStoryModalOpen(true)} />
                <CreatePost currentUser={currentUser} onAddPost={handleAddPost} />
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} currentUser={currentUser} comments={comments[post.id] || []} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onSave={handleSavePost} onViewProfile={handleViewProfile} onEdit={handleOpenEditPostModal} onDelete={handleDeletePost} />
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="bg-slate-100 min-h-screen font-[sans-serif] text-slate-800 pb-20 lg:pb-0">
            <Suspense fallback={null}>
                {viewingStoriesOfUser && <StoryViewer user={viewingStoriesOfUser} stories={stories[viewingStoriesOfUser.uid]} onClose={() => setViewingStoriesOfUser(null)} onNextUser={() => {}} onPrevUser={() => {}} onMarkAsViewed={handleMarkStoryAsViewed} />}
                <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} user={currentUser} onSave={handleUpdateUser} />
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onLogout={async () => alert('تم تسجيل الخروج (محاكاة)')} />
                <EditPostModal isOpen={isEditPostModalOpen} onClose={() => setIsEditPostModalOpen(false)} post={editingPost} onSave={handleEditPost} />
                <StoryCreatorModal isOpen={isCreateStoryModalOpen} onClose={() => setIsCreateStoryModalOpen(false)} onAddStory={handleAddStory} />
                <CreateReelModal isOpen={isCreateReelModalOpen} onClose={() => setIsCreateReelModalOpen(false)} onAddReel={handleAddReel} />
            </Suspense>

            <Header
                currentUser={currentUser}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                notifications={notifications}
                unreadNotificationCount={notifications.filter(n => !n.read).length}
                onViewProfile={() => handleViewProfile(currentUser)}
                onGoToHome={() => navigateTo('home')}
                onGoToShorts={() => navigateTo('shorts')}
                currentPage={page}
                onNotificationNavigate={handleNotificationNavigate}
            />
            <main className="max-w-7xl mx-auto pt-20 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="hidden lg:block lg:col-span-2">
                    <Sidebar 
                        currentUser={currentUser}
                        allUsers={allUsersList}
                        following={following}
                        onViewProfile={handleViewProfile}
                        onFollowToggle={handleFollowToggle}
                    />
                </aside>
                
                <div className="lg:col-span-8 min-w-0">
                    <Suspense fallback={<ContentLoader />}>
                        {renderMainContent()}
                    </Suspense>
                </div>

                <aside className="hidden lg:block lg:col-span-2">
                    <RightSidebar 
                        currentUser={currentUser}
                        allUsers={users}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        followingUsers={followingUsers}
                        onViewProfile={handleViewProfile}
                        initialTargetUser={chatTargetUser}
                        onClearTargetUser={() => setChatTargetUser(null)}
                    />
                </aside>
            </main>
            <BottomNavBar 
                currentPage={page}
                searchQuery={searchQuery}
                viewedProfileUid={viewedProfileUid}
                currentUser={currentUser}
                onHomeClick={() => navigateTo('home')}
                onShortsClick={() => navigateTo('shorts')}
                onProfileClick={() => handleViewProfile(currentUser)}
                onChatClick={() => navigateTo('chat')}
            />
        </div>
    );
};