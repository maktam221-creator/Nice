import React from 'react';
import { Comment } from '../types';

type CommentSectionProps = {
  comments: Comment[];
  onClose: () => void;
};

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onClose }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-center">التعليقات</h3>
          <button onClick={onClose} className="absolute top-3 right-4 text-2xl font-light">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          {comments.map(comment => {
            const user = comment.profiles;
            return (
              <div key={comment.id} className="flex items-start gap-3">
                <img src={user?.avatar_url} alt={user?.username} className="w-8 h-8 rounded-full" />
                <div>
                  <p>
                    <span className="font-semibold">{user?.username}</span>{' '}
                    {comment.text}
                  </p>
                  <p className="text-xs text-slate-500">{comment.created_at}</p>
                </div>
              </div>
            );
          })}
           {comments.length === 0 && <p className="text-center text-slate-500 py-4">لا توجد تعليقات بعد.</p>}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;