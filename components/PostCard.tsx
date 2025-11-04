
import React, { useState } from 'react';
import { Post, User, Comment } from '../types';
import { HeartIcon, CommentIcon, ShareIcon } from './Icons';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  currentUser: User;
  comments: Comment[];
  onLikePost: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onSharePost: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, comments, onLikePost, onAddComment, onSharePost }) => {
  const [showComments, setShowComments] = useState(false);

  const handleAddCommentWrapper = (text: string) => {
    onAddComment(post.id, text);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
        <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-bold text-slate-800">{post.author.name}</p>
          <p className="text-sm text-slate-500">{post.timestamp}</p>
        </div>
      </div>
      <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.text}</p>
      
      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="محتوى المنشور" className="rounded-lg w-full object-cover" />
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-slate-500 pb-2 border-b border-slate-200">
        <span>{post.likes} إعجاب</span>
        <span>{post.comments} تعليقات</span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-around py-1">
        <button 
          onClick={() => onLikePost(post.id)}
          className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 group"
        >
          <HeartIcon className={`w-6 h-6 transition-colors ${post.isLiked ? 'text-red-500 fill-current' : 'group-hover:text-red-500'}`} />
          <span className={`font-semibold transition-colors ${post.isLiked ? 'text-red-500' : 'group-hover:text-red-500'}`}>إعجاب</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 group"
        >
          <CommentIcon className="w-6 h-6 transition-colors group-hover:text-indigo-500" />
          <span className="font-semibold transition-colors group-hover:text-indigo-500">تعليق</span>
        </button>
        <button 
          onClick={() => onSharePost(post.id)}
          className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 group"
        >
          <ShareIcon className="w-6 h-6 transition-colors group-hover:text-green-500" />
          <span className="font-semibold transition-colors group-hover:text-green-500">مشاركة</span>
        </button>
      </div>

      {showComments && (
        <CommentSection 
          comments={comments} 
          onAddComment={handleAddCommentWrapper}
          currentUser={currentUser} 
        />
      )}
    </div>
  );
};

export default PostCard;
