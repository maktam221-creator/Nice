
import React, { useState, useEffect } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import ProfilePage from './components/ProfilePage';
import EditProfileModal from './components/EditProfileModal';
import SearchResults from './components/SearchResults';
import Sidebar from './components/Sidebar';
import { Post, User } from './types';
import { HomeIcon, UserIcon, SearchIcon, XCircleIcon } from './components/Icons';

const App: React.FC = () => {
  type Page = 'home' | 'profile';
    
  // FIX: Use Record<string, User> for better type inference with Object.values.
  const [users, setUsers] = useState<Record<string, User>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<string[]>(['sara']);

  useEffect(() => {
    // FIX: Use Record<string, User> for better type inference.
    const initialUsersData: Record<string, User> = {
      currentUser: { name: 'أنت', avatarUrl: 'https://picsum.photos/seed/you/100/100', bio: 'مرحباً! أنا أستخدم هذا التطبيق الرائع.', country: 'السعودية', gender: 'أنثى' },
      sara: { name: 'سارة', avatarUrl: 'https://picsum.photos/seed/sara/100/100' },
      ahmed: { name: 'أحمد', avatarUrl: 'https://picsum.photos/seed/ahmed/100/100' },
      fatima: { name: 'فاطمة', avatarUrl: 'https://picsum.photos/seed/fatima/100/100' },
    };
    setUsers(initialUsersData);

    const initialPosts: Post[] = [
      {
        id: 1,
        author: initialUsersData.sara,
        text: 'يوم جميل في الحديقة اليوم! الطقس كان مثالياً. ☀️',
        imageUrl: 'https://picsum.photos/seed/garden/600/400',
        likes: 15,
        shares: 7,
        isLiked: false,
        timestamp: 'قبل 5 دقائق',
        comments: [
          { id: 1, author: initialUsersData.ahmed, text: 'صور رائعة!' },
          { id: 2, author: initialUsersData.fatima, text: 'أتمنى لو كنت هناك.' },
        ],
      },
      {
        id: 2,
        author: initialUsersData.ahmed,
        text: 'أنهيت للتو قراءة كتاب رائع. أوصي به بشدة لكل محبي الخيال العلمي.',
        likes: 8,
        shares: 2,
        isLiked: true,
        timestamp: 'قبل ساعة',
        comments: [],
      },
       {
        id: 3,
        author: initialUsersData.currentUser,
        text: 'تجربة وصفة جديدة للعشاء الليلة. أتمنى أن تنجح!',
        likes: 2,
        shares: 1,
        isLiked: false,
        timestamp: 'قبل 3 ساعات',
        comments: [],
      },
    ];
    setPosts(initialPosts);
  }, []);

  const handleAddPost = (text: string, imageUrl?: string) => {
    if (!users.currentUser) return;
    const newPost: Post = {
      id: Date.now(),
      author: users.currentUser,
      text,
      imageUrl,
      likes: 0,
      shares: 0,
      isLiked: false,
      timestamp: 'الآن',
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked: isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleSharePost = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, shares: post.shares + 1 };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: number, text: string) => {
    if (!users.currentUser) return;
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: Date.now(),
            author: users.currentUser,
            text,
          };
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      })
    );
  };

  // FIX: Refactored to use a guard clause for `oldUser` to ensure correct type narrowing
  // and remove redundant checks and casts, resolving the 'unknown' type error.
  const handleUpdateProfile = (updatedUser: User) => {
    const oldUser = users.currentUser;
    if (!oldUser) return;

    setUsers(prevUsers => ({ ...prevUsers, currentUser: updatedUser }));

    if (viewedProfileUser && viewedProfileUser.name === oldUser.name) {
      setViewedProfileUser(updatedUser);
    }

    setPosts(prevPosts => prevPosts.map(post => {
      const updatedPost = { ...post };
      if (post.author.name === oldUser.name) {
        updatedPost.author = updatedUser;
      }
      updatedPost.comments = post.comments.map(comment => {
        if (comment.author.name === oldUser.name) {
          return { ...comment, author: updatedUser };
        }
        return comment;
      });
      return updatedPost;
    }));
  };

  const handleViewProfile = (user: User) => {
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
    setFollowing(prev => {
        const isFollowing = prev.includes(userName);
        if (isFollowing) {
            return prev.filter(name => name !== userName);
        } else {
            return [...prev, userName];
        }
    });
  };

  const userPosts = posts.filter(post => post.author.name === viewedProfileUser?.name);

  const lowercasedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = searchQuery ? posts.filter(post => post.text.toLowerCase().includes(lowercasedQuery) || post.author.name.toLowerCase().includes(lowercasedQuery)) : [];
  const filteredUsers = searchQuery ? Object.values(users).filter(user => user.name !== users.currentUser?.name && user.name.toLowerCase().includes(lowercasedQuery)) : [];

  if (!users.currentUser) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const renderMainContent = () => {
    if (searchQuery) {
      return <SearchResults 
                users={filteredUsers}
                posts={filteredPosts}
                currentUser={users.currentUser}
                onViewProfile={handleViewProfile}
                onLike={handleLikePost}
                onAddComment={handleAddComment}
                onShare={handleSharePost}
                query={searchQuery}
                following={following}
                onFollowToggle={handleFollowToggle}
             />;
    }
    if (currentPage === 'profile' && viewedProfileUser) {
        return <ProfilePage 
            user={viewedProfileUser} 
            posts={userPosts}
            onLike={handleLikePost}
            onAddComment={handleAddComment}
            onShare={handleSharePost}
            onAddPost={handleAddPost}
            currentUser={users.currentUser}
            onViewProfile={handleViewProfile}
            onEditProfile={() => setIsEditModalOpen(true)}
            following={following}
            onFollowToggle={handleFollowToggle}
          />
    }
    return (
        <>
            <CreatePost onAddPost={handleAddPost} currentUser={users.currentUser} />
            <div className="mt-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onAddComment={handleAddComment}
                  onShare={handleSharePost}
                  currentUser={users.currentUser}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
        </>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto py-3 px-4 flex justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-indigo-600 hidden sm:block shrink-0">Maydan</h1>
          <div className="relative flex-grow max-w-xl mx-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </span>
            <input
                type="text"
                placeholder="البحث عن مستخدمين ومنشورات..."
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
          <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
            <button onClick={handleGoHome} aria-label="الرئيسية" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <HomeIcon className={`w-7 h-7 ${currentPage === 'home' && !searchQuery ? 'text-indigo-600' : 'text-slate-500'}`} />
            </button>
            <button onClick={handleGoToMyProfile} aria-label="الملف الشخصي" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <UserIcon className={`w-7 h-7 ${currentPage === 'profile' && viewedProfileUser?.name === users.currentUser.name ? 'text-indigo-600' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto p-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2">
            {renderMainContent()}
        </main>
        <aside className="hidden lg:block sticky top-24 h-fit">
            <Sidebar 
                currentUser={users.currentUser}
                allUsers={Object.values(users)}
                following={following}
                onViewProfile={handleViewProfile}
                onFollowToggle={handleFollowToggle}
            />
        </aside>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={users.currentUser}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};

export default App;