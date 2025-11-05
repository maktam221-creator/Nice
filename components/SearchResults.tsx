import React from 'react';
import { User, Post, Comment } from '../types';
import PostCard from './PostCard';
import { UserPlusIcon } from './Icons';

interface SearchResultsProps {
  users: User[];
  posts: Post[];
  currentUser: User;
  comments: Record<number, Comment[]>;
  onViewProfile: (user: User) => void;
  onLike: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onShare: (postId: number) => void;
  onSave: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  query: string;
  following: string[];
  onFollowToggle: (userUid: string) => void;
}

interface UserResultCardProps {
    user: User;
    onViewProfile: (user: User) => void;
    isFollowing: boolean;
    onFollowToggle: (userUid: string) => void;
}

const UserResultCard: React.FC<UserResultCardProps> = ({ user, onViewProfile, isFollowing, onFollowToggle }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <button onClick={() => onViewProfile(user)} className="flex items-center space-x-4 rtl:space-x-reverse group text-right">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-bold text-slate-800 group-hover:underline">{user.name}</p>
                </div>
            </button>
            <button
                onClick={() => onFollowToggle(user.uid)}
                className={`flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0 ${
                    isFollowing 
                    ? 'text-slate-600 bg-slate-200 hover:bg-slate-300' 
                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                <UserPlusIcon className="w-4 h-4" />
                <span>{isFollowing ? 'إلغاء المتابعة' : 'متابعة'}</span>
            </button>
        </div>
    );
};


const SearchResults: React.FC<SearchResultsProps> = ({ users, posts, currentUser, comments, onViewProfile, onLike, onAddComment, onShare, onSave, onEdit, onDelete, query, following, onFollowToggle }) => {
  if (users.length === 0 && posts.length === 0) {
    return (
      <div className="text-center text-slate-500 bg-white p-8 rounded-lg shadow-md">
        <p>لا توجد نتائج بحث لـ "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {users.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">المستخدمون</h2>
          <div className="space-y-4">
            {users.map(user => (
              <UserResultCard 
                key={user.uid} 
                user={user} 
                onViewProfile={onViewProfile} 
                isFollowing={following.includes(user.uid)}
                onFollowToggle={onFollowToggle}
              />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">المنشورات</h2>
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                comments={comments[post.id] || []}
                onLike={onLike}
                onAddComment={onAddComment}
                onShare={onShare}
                onSave={onSave}
                currentUser={currentUser}
                onViewProfile={onViewProfile}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
