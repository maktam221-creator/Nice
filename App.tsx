
import React, { useState } from 'react';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import { initialPosts } from './data';
import { Post, User, Comment } from './types';

// A simple header for the logged-in view
const Header: React.FC<{ user: User }> = ({ user }) => (
  <header className="bg-white shadow-md sticky top-0 z-40">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <h1 className="text-2xl font-bold text-indigo-600">Maydan</h1>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <span className="text-slate-700 font-semibold hidden sm:block">أهلاً، {user.name}</span>
          <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  </header>
);

// A guest user object to use since authentication is removed.
const guestUser: User = {
  uid: 'guest-user',
  name: 'زائر',
  avatarUrl: 'https://picsum.photos/seed/guest/100/100',
};

const initialComments: Record<number, Comment[]> = {
    1: [
        { id: 101, author: { uid: 'user2', name: 'فاطمة الزهراء', avatarUrl: 'https://picsum.photos/seed/user2/100/100' }, text: 'أهلاً بك!' },
        { id: 102, author: guestUser, text: 'منشور رائع!' },
    ],
    2: [
        { id: 201, author: { uid: 'user1', name: 'أحمد محمود', avatarUrl: 'https://picsum.photos/seed/user1/100/100' }, text: 'بالتوفيق!' },
        { id: 202, author: guestUser, text: 'بداية موفقة.' },
        { id: 203, author: guestUser, text: 'نعم!' },
        { id: 204, author: guestUser, text: 'هيا!' },
        { id: 205, author: guestUser, text: 'ممتاز!' },
    ],
};


export const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [comments, setComments] = useState<Record<number, Comment[]>>(initialComments);

  // Use a static guest user since authentication is removed
  const appUser: User = guestUser;

  const handleAddPost = (text: string) => {
    if (!appUser) return;
    const newPost: Post = {
      id: Date.now(),
      author: appUser,
      text,
      likes: 0,
      comments: 0,
      timestamp: 'الآن',
      isLiked: false,
    };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: number, text: string) => {
    const newComment: Comment = {
      id: Date.now(),
      author: appUser,
      text,
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: (post.comments || 0) + 1 };
      }
      return post;
    }));
  };

  const handleSharePost = async (postId: number) => {
    const postToShare = posts.find(p => p.id === postId);
    if (!postToShare) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `منشور من ${postToShare.author.name}`,
          text: postToShare.text,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    } else {
      navigator.clipboard.writeText(`${postToShare.text}\n${window.location.href}`);
      alert('تم نسخ رابط المنشور.');
    }
  };
  
  // The application now directly shows the main content without a login page.
  return (
    <div className="bg-slate-100 min-h-screen font-[sans-serif]">
      <Header user={appUser} />
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreatePost currentUser={appUser} onAddPost={handleAddPost} />
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              currentUser={appUser}
              comments={comments[post.id] || []}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onSharePost={handleSharePost}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
