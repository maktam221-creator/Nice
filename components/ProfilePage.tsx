
import React, { useState, useEffect } from 'react';
import { User, Post, Reel, Comment, Bucket } from '../types';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { PencilIcon, UserPlusIcon, EyeIcon, CogIcon, HomeIcon, VideoCameraIcon, BookmarkIcon, FolderIcon } from './Icons';
import ProfileViewersModal from './ProfileViewersModal';
import * as db from '../contexts/services/supabaseService';


interface ProfilePageProps {
  user: User;
  posts: Post[];
  reels: Reel[];
  comments: Record<number, Comment[]>;
  onLike: (postId: number) => void;
  onSave: (post: Post) => void;
  onAddComment: (postId: number, text: string) => void;
  onShare: (postId: number) => void;
  onAddPost: (text: string, media?: { url: string; type: 'image' | 'video' }) => Promise<void>;
  currentUser: User;
  handleViewProfile: (user: User) => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onGoToChat: (user: User) => void;
  following: string[];
  onFollowToggle: (userUid: string) => void;
  viewers?: { viewer: User; timestamp: string }[];
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: number) => void;
  buckets: Bucket[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, reels, comments, onLike, onSave, onAddComment, onShare, onAddPost, currentUser, handleViewProfile, onEditProfile, onOpenSettings, onGoToChat, following, onFollowToggle, viewers, onEditPost, onDeletePost, buckets }) => {
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [selectedBucketId, setSelectedBucketId] = useState<number | null>(null);
  const [postsInBucket, setPostsInBucket] = useState<Post[]>([]);
  const [isLoadingBucket, setIsLoadingBucket] = useState(false);

  const isCurrentUserProfile = user.uid === currentUser.uid;
  const isFollowing = following.includes(user.uid);

  useEffect(() => {
    const fetchPosts = async () => {
        if (activeTab === 'saved' && selectedBucketId && isCurrentUserProfile) {
            setIsLoadingBucket(true);
            try {
                const bucketPosts = await db.getPostsInBucket(selectedBucketId, currentUser.uid);
                setPostsInBucket(bucketPosts);
            } catch(error) {
                console.error("Failed to fetch posts in bucket", error);
                setPostsInBucket([]);
            } finally {
                setIsLoadingBucket(false);
            }
        }
    };
    fetchPosts();
  }, [selectedBucketId, activeTab, isCurrentUserProfile, currentUser.uid]);

  const renderSavedTabContent = () => {
    if (!isCurrentUserProfile) return null;

    if (selectedBucketId) {
        return (
            <div>
                 <button onClick={() => setSelectedBucketId(null)} className="mb-4 text-sm font-semibold text-indigo-600 hover:underline">
                    &larr; العودة إلى جميع القوائم
                </button>
                {isLoadingBucket ? (
                    <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div></div>
                ) : postsInBucket.length > 0 ? (
                    <div className="space-y-6">
                        {postsInBucket.map(post => (
                            <PostCard key={post.id} post={post} comments={comments[post.id] || []} onLike={onLike} onAddComment={onAddComment} onShare={onShare} onSave={onSave} currentUser={currentUser} onViewProfile={handleViewProfile} onEdit={onEditPost} onDelete={onDeletePost} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
                        <p>هذه القائمة فارغة.</p>
                    </div>
                )}
            </div>
        )
    }

    return buckets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {buckets.map(bucket => (
                <button key={bucket.id} onClick={() => setSelectedBucketId(bucket.id)} className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center p-4 text-center hover:bg-slate-200 transition-colors group">
                    <FolderIcon className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <p className="mt-2 font-semibold text-slate-700">{bucket.name}</p>
                </button>
            ))}
        </div>
    ) : (
        <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
            <p>لم تقم بإنشاء أي قوائم بعد.</p>
            <p className="text-sm">انقر على أيقونة الحفظ في أي منشور للبدء.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <div className="relative flex-shrink-0">
                    <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-slate-200" />
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                    <div className="flex space-x-4 rtl:space-x-reverse text-slate-500 mt-2">
                        <span><strong className="text-slate-700">{posts.length}</strong> منشورات</span>
                        <span><strong className="text-slate-700">{reels.length}</strong> فيديوهات</span>
                    </div>
                     {(user.bio || (user.country && user.country.value) || (user.gender && user.gender.value && user.gender.value !== 'أفضل عدم القول')) && (
                        <div className="mt-3 text-sm text-slate-600 border-t pt-3 space-y-2">
                            {user.bio && <p>{user.bio}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {(user.country?.isPublic || isCurrentUserProfile) && user.country?.value && (
                                    <p className="font-medium flex items-center gap-2">
                                        <span role="img" aria-label="location">📍</span>
                                        <span>من {user.country.value}</span>
                                    </p>
                                )}
                                {(user.gender?.isPublic || isCurrentUserProfile) && user.gender?.value && user.gender.value !== 'أفضل عدم القول' && (
                                    <p className="font-medium flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span>{user.gender.value}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              {isCurrentUserProfile ? (
                  <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
                       <button 
                            onClick={() => setIsViewersModalOpen(true)} 
                            className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!viewers || viewers.length === 0}
                            aria-label="عرض من شاهد ملفك الشخصي"
                       >
                            <EyeIcon className="w-4 h-4" />
                            <span>{viewers ? viewers.length : 0} مشاهدات</span>
                       </button>
                       <button onClick={onEditProfile} className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                           <PencilIcon className="w-4 h-4" />
                           <span>تعديل الملف الشخصي</span>
                       </button>
                       <button onClick={onOpenSettings} className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                           <CogIcon className="w-4 h-4" />
                           <span>الإعدادات</span>
                       </button>
                  </div>
              ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => onFollowToggle(user.uid)}
                        className={`w-full sm:w-auto flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isFollowing 
                            ? 'text-slate-600 bg-slate-200 hover:bg-slate-300' 
                            : 'text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>{isFollowing ? 'إلغاء المتابعة' : 'متابعة'}</span>
                    </button>
                    {isFollowing && (
                        <button 
                            onClick={() => onGoToChat(user)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                        >
                            رسالة
                        </button>
                    )}
                  </div>
              )}
            </div>
        </div>
      </div>

      {isCurrentUserProfile && <CreatePost onAddPost={onAddPost} currentUser={currentUser} />}

      <div>
        <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex justify-center space-x-8 rtl:space-x-reverse" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>المنشورات</span>
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${activeTab === 'reels' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <VideoCameraIcon className="w-5 h-5" />
                    <span>الفيديوهات</span>
                </button>
                {isCurrentUserProfile && (
                     <button
                        onClick={() => { setActiveTab('saved'); setSelectedBucketId(null); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse ${activeTab === 'saved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <BookmarkIcon className="w-5 h-5" />
                        <span>المحفوظات</span>
                    </button>
                )}
            </nav>
        </div>
        
        {activeTab === 'posts' && (
            posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} comments={comments[post.id] || []} onLike={onLike} onAddComment={onAddComment} onShare={onShare} onSave={onSave} currentUser={currentUser} onViewProfile={handleViewProfile} onEdit={onEditPost} onDelete={onDeletePost} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
                    <p>لا توجد منشورات لعرضها.</p>
                </div>
            )
        )}

        {activeTab === 'reels' && (
            reels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {reels.map(reel => (
                        <div key={reel.id} className="aspect-w-9 aspect-h-16 bg-slate-200 rounded-md overflow-hidden">
                           <video src={reel.videoUrl} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
                    <p>لا توجد فيديوهات لعرضها.</p>
                </div>
            )
        )}

        {activeTab === 'saved' && renderSavedTabContent()}
      </div>
      
      {isCurrentUserProfile && (
        <ProfileViewersModal
            isOpen={isViewersModalOpen}
            onClose={() => setIsViewersModalOpen(false)}
            viewers={viewers || []}
            onViewProfile={handleViewProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
