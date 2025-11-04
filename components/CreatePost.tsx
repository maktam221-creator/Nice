
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { PhotoIcon, VideoCameraIcon, XCircleIcon } from './Icons';

interface CreatePostProps {
  currentUser: User;
  onAddPost: (text: string, media?: { url: string; type: 'image' | 'video' }) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onAddPost }) => {
  const [postText, setPostText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      // If a file is already in preview, revoke its URL before creating a new one to prevent memory leaks.
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(type);
    }
  };

  const removeMedia = () => {
    // When the user manually removes the media, revoke the object URL to clean up.
    if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postText.trim() || mediaFile) {
      // Pass the media URL to the parent component.
      // After this point, the parent component "owns" the URL, and this component
      // should no longer revoke it.
      onAddPost(postText, mediaFile && mediaPreview ? { url: mediaPreview, type: mediaType! } : undefined);
      
      // Reset component state for the next post.
      // We are NOT revoking the URL here because it's now in use by the PostCard.
      setPostText('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
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
          
          {mediaPreview && (
            <div className="mt-4 relative">
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="معاينة" className="rounded-lg w-full max-h-80 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="rounded-lg w-full max-h-80 bg-black" />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                aria-label="إزالة الوسائط"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
              <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors">
                <PhotoIcon className="w-6 h-6" />
                <span className="text-sm font-semibold hidden sm:block">صورة</span>
              </button>
              <button type="button" onClick={() => videoInputRef.current?.click()} className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
                <VideoCameraIcon className="w-6 h-6" />
                <span className="text-sm font-semibold hidden sm:block">فيديو</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!postText.trim() && !mediaFile}
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
