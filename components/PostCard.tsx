import React, { useState, useEffect } from 'react';
import { Post, View, Comment } from '../types';
import { HeartIcon, CommentIcon, ShareIcon, OptionsIcon } from './Icons';
import CommentSection from './CommentSection';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/services/supabaseService';

type PostCardProps = {
  post: Post;
  setView: (view: View) => void;
};

const PostCard: React.FC<PostCardProps> = ({ post, setView }) => {
  const { user: currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.some(like => like.user_id === currentUser.id));
    }
  }, [post.likes, currentUser]);

  const postUser = post.profiles;

  if (!postUser) {
    return null; // Or a loading skeleton
  }

  const handleLike = async () => {
    if (!currentUser) return;

    const currentlyLiked = post.likes.some(like => like.user_id === currentUser.id);
    
    if (currentlyLiked) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .match({ user_id: currentUser.id, post_id: post.id });
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({ user_id: currentUser.id, post_id: post.id });
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || !currentUser) return;

    const { error } = await supabase
        .from('comments')
        .insert({
            text: newComment,
            user_id: currentUser.id,
            post_id: post.id,
        });

    if (!error) {
        setNewComment('');
    } else {
        console.error("Error adding comment: ", error);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
    return 'الآن';
  }


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
      <div className="p-4 flex justify-between items-center">
        <button onClick={() => setView({ page: 'profile', userId: postUser.id })} className="flex items-center gap-3 cursor-pointer">
          <img className="w-10 h-10 rounded-full" src={postUser.avatar_url} alt={postUser.username} />
          <div>
            <p className="font-bold">{postUser.username}</p>
            <p className="text-xs text-slate-500">{timeAgo(post.created_at)}</p>
          </div>
        </button>
        <button className="text-slate-500 hover:text-slate-800">
          <OptionsIcon className="w-6 h-6" />
        </button>
      </div>
      
      {post.image_url && <img className="w-full h-auto" src={post.image_url} alt="Post content" />}
      {post.video_url && (
        <video className="w-full h-auto bg-black" controls>
          <source src={post.video_url} type="video/mp4" />
          متصفحك لا يدعم عرض مقاطع الفيديو.
        </video>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={handleLike} className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors">
            <HeartIcon className={`w-7 h-7 ${isLiked ? 'fill-current text-red-500' : ''}`} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-slate-600 hover:text-indigo-500 transition-colors">
            <CommentIcon className="w-7 h-7" />
          </button>
          <button className="flex items-center gap-2 text-slate-600 hover:text-indigo-500 transition-colors">
            <ShareIcon className="w-7 h-7" />
          </button>
        </div>
        <p className="font-semibold mb-2">{post.likes.length.toLocaleString()} إعجاب</p>
        <p className="whitespace-pre-wrap">
          <span className="font-bold">{postUser.username}</span> {post.caption}
        </p>
        
        {post.comments && post.comments.length > 0 && (
           <button onClick={() => setShowComments(!showComments)} className="text-sm text-slate-500 mt-2">
             عرض كل الـ {post.comments.length} تعليقات
           </button>
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
         <form onSubmit={handleAddComment} className="flex gap-2">
           <input
             type="text"
             value={newComment}
             onChange={(e) => setNewComment(e.target.value)}
             placeholder="أضف تعليقاً..."
             className="w-full bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
           />
           <button type="submit" className="text-indigo-600 font-semibold hover:text-indigo-800 disabled:opacity-50" disabled={!newComment.trim()}>نشر</button>
         </form>
      </div>
      
      {showComments && <CommentSection comments={post.comments} onClose={() => setShowComments(false)} />}
    </div>
  );
};

export default PostCard;