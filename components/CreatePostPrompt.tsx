import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PhotoIcon, SparklesIcon } from './Icons';

type CreatePostPromptProps = {
  onOpenCreate: () => void;
};

const CreatePostPrompt: React.FC<CreatePostPromptProps> = ({ onOpenCreate }) => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-8 border border-slate-200">
      <div className="flex items-center gap-3">
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="w-10 h-10 rounded-full"
        />
        <button
          onClick={onOpenCreate}
          className="w-full text-right bg-slate-100 rounded-full px-4 py-2 text-slate-500 hover:bg-slate-200 transition"
          aria-label="إنشاء منشور جديد"
        >
          بماذا تفكر، {profile.username}؟
        </button>
      </div>
      <hr className="my-3 border-slate-100" />
      <div className="flex justify-around items-center pt-1">
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 text-slate-600 font-medium hover:bg-slate-100 p-2 rounded-lg transition-colors w-1/2 justify-center"
          aria-label="إضافة صورة أو فيديو"
        >
          <PhotoIcon className="w-6 h-6 text-green-500" />
          <span>صورة / فيديو</span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div> {/* Vertical separator */}
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 text-slate-600 font-medium hover:bg-slate-100 p-2 rounded-lg transition-colors w-1/2 justify-center"
          aria-label="إنشاء بالذكاء الاصطناعي"
        >
          <SparklesIcon className="w-6 h-6 text-indigo-500" />
          <span>إنشاء بالذكاء الاصطناعي</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePostPrompt;