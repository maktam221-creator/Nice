

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Post, User, Comment, Reel, Story, Notification, Message, Bucket } from './types';
import { initialReels, initialStories, initialNotifications, initialMessages } from './data';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import * as db from './contexts/services/supabaseService';
import { supabase } from './contexts/AuthContext';


// Statically import components that are part of the main, initial layout
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import BottomNavBar from './components/BottomNavBar';
import StoriesTray from './components/StoriesTray';
import { ExclamationTriangleIcon } from './components/Icons';

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
const AddToBucketModal = lazy(() => import('./components/AddToBucketModal'));


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
    const { session, profile: currentUser, loading, signOut, updateProfile } = useAuth();
    
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState<Record<string, User>>({});
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [reels, setReels] = useState<Reel[]>(initialReels);
    const [stories, setStories] = useState<Record<string, Story[]>>(initialStories);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [following, setFollowing] = useState<string[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

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
    const [isAddToBucketModalOpen, setIsAddToBucketModalOpen] = useState(false);
    const [savingPost, setSavingPost] = useState<Post | null>(null);
    const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
    const [isCreateReelModalOpen, setIsCreateReelModalOpen] = useState(false);

    // Story viewer state
    const [viewingStoriesOfUser, setViewingStoriesOfUser] = useState<User | null>(null);
    const storyUsers = useMemo(() => Object.keys(stories).map(uid => users[uid]).filter(Boolean), [stories, users]);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                setDataError(null);
                setDataLoading(true);
                const [fetchedUsers, postDetails, fetchedFollowing, fetchedBuckets] = await Promise.all([
                    db.getAllUsers(),
                    db.getPostsWithDetails(currentUser.uid),
                    db.getFollowingList(currentUser.uid),
                    db.getBucketsForUser(currentUser.uid),
                ]);

                const usersMap = fetchedUsers.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {} as Record<string, User>);

                setUsers(usersMap);
                setPosts(postDetails.posts);
                setComments(postDetails.comments);
                setFollowing(fetchedFollowing);
                setBuckets(fetchedBuckets);
                
            } catch (error: any) {
                console.error("Error fetching initial data:", error);
                if (error.message && error.message.includes('security policy')) {
                    setDataError("فشل في جلب البيانات. يرجى التأكد من أن سياسات أمان الوصول (RLS) في Supabase مفعّلة وتسمح بقراءة البيانات.");
                } else {
                    setDataError("حدث خطأ غير متوقع أثناء تحميل البيانات.");
                }
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    // --- REAL-TIME SUBSCRIPTIONS ---
    useEffect(() => {
        if (!currentUser) return;

        const handleNewPost = (newPostData: any) => {
            const newPostForUI: Post = {
                ...db.fromPostSnakeCase(newPostData),
                likes: 0, comments: 0, shares: 0, isLiked: false, isSaved: false,
            };
            setPosts(prev => prev.find(p => p.id === newPostForUI.id) ? prev : [newPostForUI, ...prev]);
            setUsers(prev => ({ ...prev, [newPostForUI.author.uid]: newPostForUI.author }));
        };
        const handleUpdatePost = (updatedPostData: any) => {
            setPosts(prev => prev.map(p => p.id === updatedPostData.id ? { ...p, text: updatedPostData.text } : p));
        };
        const handleDeletePostRT = (postId: number) => {
            setPosts(prev => prev.filter(p => p.id !== postId));
        };

        const handleNewLike = (like: { post_id: number, user_id: string }) => {
            setPosts(prev => prev.map(p => {
                if (p.id === like.post_id) {
                    return { ...p, likes: p.likes + 1, isLiked: p.isLiked || (like.user_id === currentUser.uid) };
                }
                return p;
            }));
        };
        const handleDeleteLike = (like: { post_id: number, user_id: string }) => {
             setPosts(prev => prev.map(p => {
                if (p.id === like.post_id) {
                    return { ...p, likes: Math.max(0, p.likes - 1), isLiked: (like.user_id === currentUser.uid) ? false : p.isLiked };
                }
                return p;
            }));
        };

        const handleNewComment = (newCommentData: any) => {
            const newCommentForUI = db.fromCommentSnakeCase(newCommentData);
            const postId = newCommentData.post_id;
            setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newCommentForUI] }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
            setUsers(prev => ({ ...prev, [newCommentForUI.author.uid]: newCommentForUI.author }));
        };
        
        const postsChannel = db.onPostsChanges(handleNewPost, handleUpdatePost, handleDeletePostRT);
        const likesChannel = db.onLikesChanges(handleNewLike, handleDeleteLike);
        const commentsChannel = db.onCommentsChanges(handleNewComment);

        return () => {
            supabase.removeChannel(postsChannel);
            supabase.removeChannel(likesChannel);
            supabase.removeChannel(commentsChannel);
        };
    }, [currentUser]);


    const filteredPosts = useMemo(() => posts.filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.name.toLowerCase().includes(searchQuery.toLowerCase())), [posts, searchQuery]);
    const filteredUsers = useMemo(() => {
        return currentUser ? (Object.values(users) as User[]).filter(u => u.uid !== currentUser.uid && u.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
    }, [users, searchQuery, currentUser]);
    const allUsersList = useMemo(() => (Object.values(users) as User[]), [users]);
    const followingUsers = useMemo(() => following.map(uid => users[uid]).filter(Boolean), [following, users]);
    
    // --- AUTH-DEPENDENT CHECKS ---
    if (loading) return <LoadingSpinner />;
    if (!session || !currentUser) return <AuthPage />;

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
    const handleAddPost = async (text: string, media?: { url: string; type: 'image' | 'video' }) => {
        const postData = {
            author_uid: currentUser.uid,
            text,
            image_url: media?.type === 'image' ? media.url : undefined,
            video_url: media?.type === 'video' ? media.url : undefined,
        };
        // The error will be caught by the calling component (CreatePost).
        const newPost = await db.addPost(postData);
    
        // Add UI-specific fields and update the state immediately
        const newPostForUI: Post = {
            ...newPost,
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
        };
        // The real-time handler has a duplicate check, so this is safe.
        setPosts(prev => [newPostForUI, ...prev]);
    };
    const handleLikePost = async (postId: number) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        // Optimistic UI update
        setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
        try {
            await db.toggleLikePost(postId, currentUser.uid, post.isLiked);
        } catch (error) {
            console.error("Failed to like post:", error);
            // Revert on failure
            setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: post.isLiked, likes: post.likes } : p));
        }
    };
    
    const handleOpenBucketModal = (post: Post) => {
        setSavingPost(post);
        setIsAddToBucketModalOpen(true);
    };

    const handlePostSaveChange = (postId: number, isSaved: boolean) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved } : p));
    };

    const handleAddComment = async (postId: number, text: string) => {
        try {
             // Real-time will handle the UI update
            await db.addCommentToPost(postId, currentUser.uid, text);
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert("فشل إضافة التعليق.");
        }
    };
    const handleSharePost = async (postId: number) => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            const shareUrl = window.location.origin;
            try {
                if (navigator.share) {
                    await navigator.share({ title: `منشور من ${post.author.name}`, text: post.text, url: shareUrl });
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
    const handleEditPost = async (postId: number, newText: string) => {
        try {
            // Real-time will handle the UI update
            await db.updatePostText(postId, newText);
            setIsEditPostModalOpen(false);
            setEditingPost(null);
        } catch (error) {
            console.error("Failed to edit post:", error);
            alert("فشل تعديل المنشور.");
        }
    };
    const handleDeletePost = async (postId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
            try {
                // Real-time will handle the UI update
                await db.deletePostById(postId);
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("فشل حذف المنشور.");
            }
        }
    };

    // User & Profile Interactions
    const handleUpdateUser = (updatedUser: User) => updateProfile(updatedUser);
    const handleFollowToggle = async (userUid: string) => {
        const isCurrentlyFollowing = following.includes(userUid);
        setFollowing(prev => 
            isCurrentlyFollowing 
                ? prev.filter(id => id !== userUid) 
                : [...prev, userUid]
        );
        try {
            await db.toggleFollowUser(currentUser.uid, userUid, isCurrentlyFollowing);
        } catch (error) {
            console.error("Failed to toggle follow:", error);
            setFollowing(prev => 
                isCurrentlyFollowing 
                    ? [...prev, userUid]
                    : prev.filter(id => id !== userUid) 
            );
        }
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
        if (dataLoading) {
            return <ContentLoader />;
        }
        if (dataError) {
             return (
                <div className="bg-red-50 border-l-4 rtl:border-l-0 rtl:border-r-4 border-red-500 text-red-700 p-4 rounded-md shadow-md my-6" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3 rtl:mr-0 rtl:ml-3" />
                        </div>
                        <div>
                            <p className="font-bold">خطأ في الاتصال بقاعدة البيانات</p>
                            <p className="text-sm">{dataError}</p>
                            <p className="mt-2 text-xs">
                                للمساعدة، يمكنك مراجعة{' '}
                                <a href="https://supabase.com/docs/guides/auth/row-level-security" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-800">
                                    توثيق سياسات الأمان (RLS) في Supabase
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        if (searchQuery) {
            return <SearchResults users={filteredUsers} posts={filteredPosts} comments={comments} currentUser={currentUser} onViewProfile={handleViewProfile} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onSave={handleOpenBucketModal} onEdit={handleOpenEditPostModal} onDelete={handleDeletePost} query={searchQuery} following={following} onFollowToggle={handleFollowToggle} />;
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
            return <ProfilePage user={viewedProfileUser} posts={userPosts} reels={userReels} comments={comments} onLike={handleLikePost} onSave={handleOpenBucketModal} onAddComment={handleAddComment} onShare={handleSharePost} onAddPost={handleAddPost} currentUser={currentUser} handleViewProfile={handleViewProfile} onEditProfile={() => setIsEditProfileModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)} onGoToChat={(user) => { setPage('chat'); setChatTargetUser(user); }} following={following} onFollowToggle={handleFollowToggle} viewers={[]} onEditPost={handleOpenEditPostModal} onDeletePost={handleDeletePost} buckets={buckets} />;
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
                        <PostCard key={post.id} post={post} currentUser={currentUser} comments={comments[post.id] || []} onLike={handleLikePost} onAddComment={handleAddComment} onShare={handleSharePost} onSave={handleOpenBucketModal} onViewProfile={handleViewProfile} onEdit={handleOpenEditPostModal} onDelete={handleDeletePost} />
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
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onLogout={signOut} />
                <EditPostModal isOpen={isEditPostModalOpen} onClose={() => setIsEditPostModalOpen(false)} post={editingPost} onSave={handleEditPost} />
                <AddToBucketModal isOpen={isAddToBucketModalOpen} onClose={() => setIsAddToBucketModalOpen(false)} post={savingPost} onSaveChange={handlePostSaveChange} />
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
            <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-20">
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