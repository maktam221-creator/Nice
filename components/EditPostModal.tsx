
import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { XIcon } from './Icons';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (postId: number, newText: string) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ isOpen, onClose, post, onSave }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (post) {
      setText(post.text);
    }
  }, [post]);

  if (!isOpen || !post) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(post.id, text);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-xl font-bold text-slate-800">تعديل المنشور</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            rows={5}
            placeholder="اكتب منشورك..."
            autoFocus
          />
          
          <div className="flex justify-end items-center border-t pt-4 mt-4 space-x-2 rtl:space-x-reverse">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              إلغاء
            </button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors" disabled={!text.trim()}>
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;