import React, { useState } from 'react';
import { User, Post } from '../types';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { PencilIcon, UserPlusIcon, EyeIcon, CogIcon } from './Icons';
import ProfileViewersModal from './ProfileViewersModal';

interface ProfilePageProps {
  user: User;
  posts: Post[];
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
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, onLike, onAddComment, onShare, onAddPost, currentUser, onViewProfile, onEditProfile, onOpenSettings, onGoToChat, following, onFollowToggle, viewers }) => {
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const isCurrentUserProfile = user.name === currentUser.name;
  const isFollowing = following.includes(user.name);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-slate-200 flex-shrink-0" />
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-slate-500 mt-1">{posts.length} {posts.length === 1 ? 'منشور' : 'منشورات'}</p>
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
        <h3 className="text-xl font-bold text-slate-800 mb-4">{isCurrentUserProfile ? 'منشوراتك' : `منشورات ${user.name}`}</h3>
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={onLike} 
                onAddComment={onAddComment}
                onShare={onShare}
                currentUser={currentUser} 
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
            <p>لا توجد منشورات لعرضها.</p>
          </div>
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
