
import React from 'react';
import { Post } from '../types';
import { HeartIcon, CommentIcon, ShareIcon } from './Icons';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
        <button className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100">
          <HeartIcon className="w-6 h-6" />
          <span className="font-semibold">إعجاب</span>
        </button>
        <button className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100">
          <CommentIcon className="w-6 h-6" />
          <span className="font-semibold">تعليق</span>
        </button>
        <button className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100">
          <ShareIcon className="w-6 h-6" />
          <span className="font-semibold">مشاركة</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
