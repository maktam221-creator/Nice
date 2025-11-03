

import React, { useState, useRef } from 'react';
import { enhancePost } from '../services/geminiService';
import { SparklesIcon, PhotoIcon, XCircleIcon } from './Icons';
import { uploadMedia } from '../services/cloudinaryService';

interface CreatePostProps {
  onAddPost: (text: string, imageUrl?: string) => void;
  currentUser: { name: string; avatarUrl: string };
}

const CreatePost: React.FC<CreatePostProps> = ({ onAddPost, currentUser }) => {
  const [postText, setPostText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postText.trim() || image) {
      onAddPost(postText, image || undefined);
      setPostText('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEnhance = async () => {
    if (!postText.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhancedText = await enhancePost(postText);
      setPostText(enhancedText);
    } catch (error) {
      console.error("Failed to enhance post:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImage(null);
      try {
        const imageUrl = await uploadMedia(file, 'image');
        setImage(imageUrl);
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert('حدث خطأ أثناء تحميل الصورة. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-start space-x-4">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full" />
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            rows={3}
            placeholder="بماذا تفكر؟"
          />
          {isUploading && (
            <div className="mt-2 text-center text-slate-500 py-4">
                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm">جاري تحميل الصورة...</p>
            </div>
          )}
          {image && !isUploading && (
            <div className="mt-2 relative">
              <img src={image} alt="معاينة" className="rounded-lg w-full max-h-60 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                aria-label="إزالة الصورة"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                    className="flex items-center justify-center w-10 h-10 text-slate-500 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="إضافة صورة"
                >
                    <PhotoIcon className="w-6 h-6 text-green-500" />
                </button>
                <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing || !postText.trim()}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                {isEnhancing ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                ) : (
                    <SparklesIcon className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{isEnhancing ? 'تحسين...' : 'تحسين'}</span>
                </button>
            </div>
            <button
              type="submit"
              disabled={(!postText.trim() && !image) || isUploading}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              نشر
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
            disabled={isUploading}
          />
        </form>
      </div>
    </div>
  );
};

export default CreatePost;