

import React, { useState, useRef } from 'react';
import { User } from '../types';
import { PhotoIcon, VideoCameraIcon, XCircleIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../contexts/services/supabaseService';

interface CreatePostProps {
  currentUser: User;
  onAddPost: (text: string, media?: { url: string; type: 'image' | 'video' }) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onAddPost }) => {
  const { user } = useAuth();
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };
  
  React.useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        console.error("User not authenticated");
        return;
    }
    if (postText.trim() || mediaFile) {
        setIsUploading(true);
        setUploadError(null);
        let mediaData: { url: string; type: 'image' | 'video' } | undefined = undefined;

        try {
            if (mediaFile && mediaType) {
                const publicUrl = await uploadMedia(mediaFile, 'posts', user.id);
                mediaData = { url: publicUrl, type: mediaType };
            }
            await onAddPost(postText, mediaData);
            setPostText('');
            removeMedia();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            let errorMessage = "فشل النشر. حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.";
            if (error && typeof error.message === 'string') {
                if (error.message.includes('security policy') || error.message.includes('permission denied')) {
                    errorMessage = "فشل النشر. تحقق من سياسات الأمان (RLS) في Supabase للسماح بالعملية المطلوبة.";
                } else {
                    errorMessage = error.message;
                }
            }
            setUploadError(errorMessage);
        } finally {
            setIsUploading(false);
        }
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
            disabled={isUploading}
          />
          
          {uploadError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  <p><strong className="font-semibold">فشل النشر:</strong> {uploadError}</p>
              </div>
          )}

          {mediaPreview && (
            <div className="mt-4 relative">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="معاينة" className="rounded-lg w-full max-h-80 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="rounded-lg w-full max-h-80 bg-black" />
              )}
              {!isUploading && (
                <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                    aria-label="إزالة الوسائط"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          {isUploading && (
              <div className="mt-2 flex items-center justify-center text-slate-500">
                  <div className="w-5 h-5 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin mr-2"></div>
                  <span>جاري الرفع...</span>
              </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
              <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploading} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50">
                <PhotoIcon className="w-6 h-6" />
                <span className="text-sm font-semibold hidden sm:block">صورة</span>
              </button>
              <button type="button" onClick={() => videoInputRef.current?.click()} disabled={isUploading} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50">
                <VideoCameraIcon className="w-6 h-6" />
                <span className="text-sm font-semibold hidden sm:block">فيديو</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={(!postText.trim() && !mediaFile) || isUploading}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'جاري النشر...' : 'نشر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;