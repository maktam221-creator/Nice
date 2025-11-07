import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import PostCard from './PostCard';
import ProfilePage from './ProfilePage';
import BottomNavBar from './BottomNavBar';
import AuthPage from './AuthPage';
import CreatePost from './CreatePost';
import Header from './Header';
import CreatePostPrompt from './CreatePostPrompt';
import { Post, View, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/services/supabaseService';

const App: React.FC = () => {
  const { session, profile, authLoading, authError, signOut } = useAuth();
  const [view, setView] = useState<View>({ page: 'feed' });
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError(null);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*), comments(*, profiles(*)), likes(user_id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setPostsError("فشل جلب المنشورات. يرجى التحقق من سياسات RLS في Supabase. تأكد من وجود سياسة تسمح للمستخدمين المسجلين بقراءة جدول 'posts'.");
      setPosts([]);
    } else if (data) {
      setPosts(data as Post[]);
    }
    setPostsLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      fetchPosts();

      const postsChannel = supabase.channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
            const { data: newPost, error } = await supabase
              .from('posts')
              .select('*, profiles(*), comments(*, profiles(*)), likes(user_id)')
              .eq('id', payload.new.id)
              .single();
            if (newPost) {
              setPosts(currentPosts => [newPost as Post, ...currentPosts]);
            }
        }).subscribe();
      
      const likesChannel = supabase.channel('public:likes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload) => {
            // FIX: Cast `payload.new` and `payload.old` to `any` to safely access properties.
            // This is necessary because for DELETE events `payload.new` is an empty object,
            // and for INSERT events `payload.old` is an empty object, which can cause type errors.
            const postId = (payload.new as any).post_id || (payload.old as any).post_id;
            const userId = (payload.new as any).user_id || (payload.old as any).user_id;

            setPosts(currentPosts => currentPosts.map(p => {
                if (p.id === postId) {
                    let newLikes = [...p.likes];
                    if (payload.eventType === 'INSERT') {
                        newLikes.push({ user_id: userId });
                    } else if (payload.eventType === 'DELETE') {
                        newLikes = newLikes.filter(l => l.user_id !== userId);
                    }
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
        }).subscribe();

      const commentsChannel = supabase.channel('public:comments')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, async (payload) => {
            const { data: profileData } = await supabase.from('profiles').select('username, avatar_url').eq('id', payload.new.user_id).single();
            if (profileData) {
                const newComment = { ...payload.new, profiles: profileData } as Comment;
                setPosts(currentPosts => currentPosts.map(p => {
                    if (p.id === payload.new.post_id) {
                        return { ...p, comments: [...p.comments, newComment] };
                    }
                    return p;
                }));
            }
        }).subscribe();

      return () => {
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(commentsChannel);
      };
    }
  }, [session, fetchPosts]);


  if (!session) {
    return <AuthPage />;
  }
  
  if (authLoading) {
      return <div className="flex justify-center items-center h-screen">جاري تحميل الملف الشخصي...</div>
  }

  if (authError) {
      return <div className="flex justify-center items-center h-screen text-red-500 p-4 text-center">{authError}</div>;
  }
  
  if (!profile) {
      return <div className="flex justify-center items-center h-screen">لم يتم العثور على الملف الشخصي. حاول تسجيل الخروج والدخول مرة أخرى.</div>
  }

  const renderContent = () => {
    if (view.page === 'profile' && view.userId) {
      return <ProfilePage key={view.userId} userId={view.userId} setView={setView} />;
    }
    
    // Default to feed
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <CreatePostPrompt onOpenCreate={() => setCreateModalOpen(true)} />
        {postsLoading ? (
          <p className="text-center text-slate-500">جاري تحميل المنشورات...</p>
        ) : postsError ? (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{postsError}</p>
        ) : posts.length === 0 ? (
           <p className="text-center text-slate-500 mt-10">لا توجد منشورات حتى الآن. كن أول من ينشر!</p>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                setView={setView}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      <div className="flex">
        <Sidebar 
          setView={setView} 
          currentView={view}
          signOut={signOut} 
          currentUserId={profile.id}
        />
        <main className="flex-1 transition-all duration-300 md:mr-64 pb-20 md:pb-0">
          <Header />
          {renderContent()}
        </main>
      </div>
      <BottomNavBar 
        setView={setView}
        currentView={view} 
        signOut={signOut}
        currentUserId={profile.id}
      />
      
      {isCreateModalOpen && <CreatePost onClose={() => setCreateModalOpen(false)} onPostCreated={fetchPosts} />}
    </div>
  );
};

export default App;