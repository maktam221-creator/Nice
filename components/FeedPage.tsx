import React, { useState, useEffect, useCallback } from 'react';
import { Post, View } from '../types';
import { supabase } from '../contexts/services/supabaseService';
import PostCard from './PostCard';
import CreatePostPrompt from './CreatePostPrompt';
import CreatePost from './CreatePost';

type FeedPageProps = {
  setView: (view: View) => void;
};

const FeedPage: React.FC<FeedPageProps> = ({ setView }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    // setLoading(true); // Prevent full screen loading on real-time updates
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*),
        likes ( user_id ),
        comments ( *, profiles ( username, avatar_url ) )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setError("فشل تحميل المنشورات. يرجى التحقق من سياسات RLS في Supabase. تأكد من وجود سياسة تسمح بقراءة جدول 'posts' والجداول المرتبطة به ('profiles', 'likes', 'comments').");
    } else if (data) {
      setPosts(data as any[]); // Supabase types can be tricky with joins
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, [fetchPosts]);

  if (loading) {
    return <div className="text-center p-10">جاري تحميل المنشورات...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <>
      <CreatePostPrompt onOpenCreate={() => setIsCreatePostOpen(true)} />
      
      <div className="space-y-8">
        {posts.map(post => (
          <PostCard key={post.id} post={post} setView={setView} />
        ))}
         {posts.length === 0 && <p className="text-center text-slate-500 py-10">لا توجد منشورات حتى الآن. كن أول من ينشر!</p>}
      </div>

      {isCreatePostOpen && (
        <CreatePost
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => {
            // No need to call fetchPosts here as the subscription will handle it
          }}
        />
      )}
    </>
  );
};

export default FeedPage;