
import React, { useState } from 'react';
import { User } from '../types';

interface CreatePostProps {
  currentUser: User;
  onAddPost: (text: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onAddPost }) => {
  const [postText, setPostText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postText.trim()) {
      onAddPost(postText);
      setPostText('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4 rtl:space-x-reverse">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full" />
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            rows={3}
            placeholder={`بماذا تفكر يا ${currentUser.name}؟`}
          />
          <div className="flex justify-end items-center mt-2">
            <button
              type="submit"
              disabled={!postText.trim()}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              نشر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
