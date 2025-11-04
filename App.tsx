
import React, { useState } from 'react';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import { initialPosts } from './data';
import { Post, User } from './types';

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

export const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

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
    };
    setPosts([newPost, ...posts]);
  };
  
  // The application now directly shows the main content without a login page.
  return (
    <div className="bg-slate-100 min-h-screen font-[sans-serif]">
      <Header user={appUser} />
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreatePost currentUser={appUser} onAddPost={handleAddPost} />
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
};