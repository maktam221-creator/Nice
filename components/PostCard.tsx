import React, { useState } from 'react';
import { Post, User } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon } from './Icons';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onShare: (postId: number) => void;
  onSave: (postId: number) => void;
  currentUser: User;
  onViewProfile: (user: User) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onAddComment, onShare, onSave, currentUser, onViewProfile }) => {
  const [showComments, setShowComments] = useState(false);

  const handleShare = async () => {
    // Construct a shareable URL from the origin to ensure it's always valid.
    const shareUrl = `${window.location.origin}/#post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `منشور من ${post.author.name}`,
          text: post.text,
          url: shareUrl,
        });
        onShare(post.id);
      } catch (error) {
        console.error('خطأ في المشاركة:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('المشاركة غير مدعومة على هذا المتصفح.');
    }
  };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center mb-4">
        <button onClick={() => onViewProfile(post.author)} className="flex items-center space-x-4 rtl:space-x-reverse group">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-bold text-slate-800 group-hover:underline">{post.author.name}</p>
              <p className="text-sm text-slate-500 text-right">{post.timestamp}</p>
            </div>
        </button>
      </div>
      <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.text}</p>
      
      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="محتوى المنشور" className="rounded-lg w-full object-cover" />
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-slate-500 pb-2">
        <span>{post.likes > 0 ? `${post.likes} إعجاب` : 'كن أول من يعجب بهذا'}</span>
        <div className="flex space-x-4 rtl:space-x-reverse">
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {post.comments.length} تعليقات
            </button>
            <span>{post.shares} مشاركات</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex border-t border-b border-slate-200 py-1">
        <button
          onClick={() => onLike(post.id)}
          className={`w-1/4 flex justify-center items-center space-x-2 p-2 rounded-md transition-colors hover:bg-slate-100 ${
            post.isLiked ? 'text-red-500' : 'text-slate-600'
          }`}
        >
          <HeartIcon className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="font-semibold">إعجاب</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-1/4 flex justify-center items-center space-x-2 p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100"
        >
          <CommentIcon className="w-6 h-6" />
          <span className="font-semibold">تعليق</span>
        </button>
        <button
          onClick={handleShare}
          className="w-1/4 flex justify-center items-center space-x-2 p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100"
        >
          <ShareIcon className="w-6 h-6" />
          <span className="font-semibold">مشاركة</span>
        </button>
         <button
          onClick={() => onSave(post.id)}
          className={`w-1/4 flex justify-center items-center space-x-2 p-2 rounded-md transition-colors hover:bg-slate-100 ${
            post.isSaved ? 'text-indigo-600' : 'text-slate-600'
          }`}
        >
          <BookmarkIcon className={`w-6 h-6 ${post.isSaved ? 'fill-current' : ''}`} />
          <span className="font-semibold">حفظ</span>
        </button>
      </div>
      
      {showComments && <CommentSection comments={post.comments} onAddComment={(text) => onAddComment(post.id, text)} currentUser={currentUser} />}
    </div>
  );
};

export default PostCard;