
import React, { useState } from 'react';
import { Comment, User } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  currentUser: User;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      {/* Add new comment form */}
      <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-4">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full" />
        <div className="w-full">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <button type="submit" className="hidden">
            Submit
          </button>
        </div>
      </form>

      {/* List of comments */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3 text-sm">
            <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-9 h-9 rounded-full" />
            <div className="bg-slate-100 p-3 rounded-lg flex-1">
              <p className="font-semibold text-slate-800">{comment.author.name}</p>
              <p className="text-slate-600">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
