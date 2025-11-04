

import React, { useState, useRef } from 'react';
import { enhancePost } from '../contexts/services/geminiService';
import { PhotoIcon, SparklesIcon, XIcon } from './Icons';
import { uploadMedia } from '../contexts/services/cloudinaryService';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (storyData: { type: 'image' | 'text'; content: string; caption?: string; backgroundColor?: string; }) => void;
}

const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({ isOpen, onClose, onAddStory }) => {
  const [storyType, setStoryType] = useState<'image' | 'text'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('bg-gradient-to-br from-purple-500 to-indigo-600');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundOptions = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-green-400 to-blue-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-slate-700 to-slate-900',
  ];

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImage(null);
      setStoryType('image');
      try {
        const imageUrl = await uploadMedia(file, 'image');
        setImage(imageUrl);
      } catch (error) {
        console.error("Failed to upload story image:", error);
        alert('حدث خطأ أثناء تحميل صورة القصة. يرجى المحاولة مرة أخرى.');
        handleClose();
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEnhance = async () => {
    const textToEnhance = storyType === 'image' ? caption : textContent;
    if (!textToEnhance.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const enhancedText = await enhancePost(textToEnhance);
      if (storyType === 'image') {
        setCaption(enhancedText);
      } else {
        setTextContent(enhancedText);
      }
    } catch (error) {
      console.error("Failed to enhance story text:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const resetState = () => {
    setImage(null);
    setCaption('');
    setTextContent('');
    setBackgroundColor(backgroundOptions[0]);
    setStoryType('image');
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = () => {
    if (storyType === 'image' && image) {
      onAddStory({ type: 'image', content: image, caption });
    } else if (storyType === 'text' && textContent.trim()) {
      onAddStory({ type: 'text', content: textContent, backgroundColor });
    }
    handleClose();
  };
  
  const canSubmit = !isUploading && ((storyType === 'image' && image) || (storyType === 'text' && textContent.trim()));
  const canEnhance = !isUploading && ((storyType === 'image' && caption.trim()) || (storyType === 'text' && textContent.trim()));

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-4" aria-modal="true" role="dialog">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-4">
        <button onClick={handleClose} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors" aria-label="إغلاق">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">إنشاء قصة</h2>
        <div className="w-10"></div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden relative bg-slate-800">
        {isUploading ? (
            <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg">جاري تحميل الصورة...</p>
            </div>
        ) : storyType === 'image' && image ? (
          <>
            <img src={image} alt="معاينة القصة" className="object-contain h-full w-full" />
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="أضف تعليقاً..."
              className="absolute bottom-20 w-11/12 max-w-md mx-auto p-3 bg-black bg-opacity-60 text-white text-center rounded-lg border border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center p-4 ${backgroundColor}`}>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="ابدأ الكتابة"
              className="w-full h-1/2 bg-transparent text-white text-3xl font-bold text-center resize-none focus:outline-none placeholder-white placeholder-opacity-70"
            />
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4">
        {storyType === 'text' && !isUploading && (
            <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse mb-4">
                {backgroundOptions.map(bg => (
                    <button key={bg} onClick={() => setBackgroundColor(bg)} className={`w-8 h-8 rounded-full ${bg} border-2 ${backgroundColor === bg ? 'border-white' : 'border-transparent'}`}></button>
                ))}
            </div>
        )}
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    <PhotoIcon className="w-5 h-5"/>
                    <span>صورة</span>
                </button>
                <button
                    onClick={() => setStoryType('text')}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    Aa نص
                </button>
                 <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={isEnhancing || !canEnhance}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-indigo-300 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                    {isEnhancing ? (
                        <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                    ) : (
                        <SparklesIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              نشر القصة
            </button>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" disabled={isUploading}/>
    </div>
  );
};

export default StoryCreatorModal;