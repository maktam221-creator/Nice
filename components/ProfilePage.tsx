

import React, { useState, useRef } from 'react';
import { User, Post, Reel } from '../types';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { PencilIcon, UserPlusIcon, EyeIcon, CogIcon, CameraIcon, HomeIcon, VideoCameraIcon } from './Icons';
import ProfileViewersModal from './ProfileViewersModal';
import { uploadMedia } from '../services/cloudinaryService';

interface ProfilePageProps {
  user: User;
  posts: Post[];
  reels: Reel[];
  onLike: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onShare: (postId: number) => void;
  onAddPost: (text: string, imageUrl?: string) => void;
  currentUser: User;
  onViewProfile: (user: User) => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onGoToChat: (user: User) => void;
  following: string[];
  onFollowToggle: (userName: string) => void;
  viewers?: { viewer: User; timestamp: string }[];
  onUpdateAvatar: (newAvatarUrl: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, reels, onLike, onAddComment, onShare, onAddPost, currentUser, onViewProfile, onEditProfile, onOpenSettings, onGoToChat, following, onFollowToggle, viewers, onUpdateAvatar }) => {
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const isCurrentUserProfile = user.name === currentUser.name;
  const isFollowing = following.includes(user.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        const newAvatarUrl = await uploadMedia(file, 'image');
        onUpdateAvatar(newAvatarUrl);
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        alert('حدث خطأ أثناء تحميل الصورة الرمزية. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <div className="relative flex-shrink-0">
                    <img src={user.avatarUrl} alt={user.name} className={`w-24 h-24 rounded-full border-4 border-slate-200 transition-opacity ${isUploadingAvatar ? 'opacity-50' : ''}`} />
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 rounded-full">
                            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                    )}
                    {isCurrentUserProfile && (
                        <>
                            <button
                                onClick={triggerFileSelect}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 bg-slate-700 text-white rounded-full p-2 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="تغيير صورة الملف الشخصي"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/*"
                                disabled={isUploadingAvatar}
                            />
                        </>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                    <div className="flex space-x-4 rtl:space-x-reverse text-slate-500 mt-2">
                        <span><strong className="text-slate-700">{posts.length}</strong> منشورات</span>
                        <span><strong className="text-slate-700">{reels.length}</strong> فيديوهات</span>
                    </div>
                    {(user.bio || user.country) && (
                        <div className="mt-3 text-sm text-slate-600 border-t pt-3 space-y-1">
                            {user.bio && <p>{user.bio}</p>}
                            {(user.country?.isPublic || isCurrentUserProfile) && user.country?.value && <p className="font-medium">📍 من {user.country.value}</p>}
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
                        onClick={() => onFollowToggle(user.name)}
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
            </nav>
        </div>
        
        {activeTab === 'posts' && (
            posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} onLike={onLike} onAddComment={onAddComment} onShare={onShare} currentUser={currentUser} onViewProfile={onViewProfile} />
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
      </div>
      
      {isCurrentUserProfile && (
        <ProfileViewersModal
            isOpen={isViewersModalOpen}
            onClose={() => setIsViewersModalOpen(false)}
            viewers={viewers || []}
            onViewProfile={onViewProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
