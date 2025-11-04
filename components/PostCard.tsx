
import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from './Icons';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  currentUser: User;
  comments: Comment[];
  onLike: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onShare: (postId: number) => void;
  onSave: (postId: number) => void;
  onViewProfile: (user: User) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, comments, onLike, onAddComment, onShare, onSave, onViewProfile, onEdit, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAuthor = post.author.uid === currentUser.uid;

  const handleAddCommentWrapper = (text: string) => {
    onAddComment(post.id, text);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onViewProfile(post.author)} className="flex items-center space-x-4 rtl:space-x-reverse group">
          <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full" />
          <div>
            <p className="font-bold text-slate-800 group-hover:underline">{post.author.name}</p>
            <p className="text-sm text-slate-500">{post.timestamp}</p>
          </div>
        </button>
        {isAuthor && (
            <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                    <EllipsisVerticalIcon className="w-6 h-6" />
                </button>
                {menuOpen && (
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-slate-100 animate-fade-in-up origin-top-left rtl:origin-top-right">
                        <button onClick={() => { onEdit(post); setMenuOpen(false); }} className="w-full text-right flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                           <PencilIcon className="w-5 h-5 text-slate-500"/> <span>تعديل</span>
                        </button>
                        <button onClick={() => { onDelete(post.id); setMenuOpen(false); }} className="w-full text-right flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                           <TrashIcon className="w-5 h-5"/> <span>حذف</span>
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
      <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.text}</p>
      
      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="محتوى المنشور" className="rounded-lg w-full object-cover" />
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-slate-500 py-2 border-y border-slate-200">
        <span>{post.likes} إعجاب</span>
        <span>{post.comments} تعليقات</span>
      </div>
      
      <div className="flex justify-around pt-1">
        <button 
          onClick={() => onLike(post.id)}
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
          onClick={() => onShare(post.id)}
          className="flex-1 flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 group"
        >
          <ShareIcon className="w-6 h-6 transition-colors group-hover:text-green-500" />
          <span className="font-semibold transition-colors group-hover:text-green-500">مشاركة</span>
        </button>
        <button 
          onClick={() => onSave(post.id)}
          className="flex-1 hidden sm:flex justify-center items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 group"
        >
          <BookmarkIcon className={`w-6 h-6 transition-colors ${post.isSaved ? 'text-blue-500 fill-current' : 'group-hover:text-blue-500'}`} />
          <span className={`font-semibold transition-colors ${post.isSaved ? 'text-blue-500' : 'group-hover:text-blue-500'}`}>حفظ</span>
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
