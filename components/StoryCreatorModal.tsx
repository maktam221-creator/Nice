
import React, { useState, useRef } from 'react';
import { enhancePost } from '../contexts/services/geminiService';
import { SparklesIcon, XIcon, PhotoIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../contexts/services/supabaseService';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (storyData: {
    type: 'image' | 'text';
    content: string;
    caption?: string;
    backgroundColor?: string;
  }) => void;
}

const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({ isOpen, onClose, onAddStory }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'text' | 'image'>('text');
  
  // Text story state
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('bg-gradient-to-br from-purple-500 to-indigo-600');
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Shared state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image story state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const backgroundOptions = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-green-400 to-blue-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-slate-700 to-slate-900',
  ];

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEnhance = async () => {
    if (!textContent.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhancedText = await enhancePost(textContent);
      setTextContent(enhancedText);
    } catch (error) {
      console.error("Failed to enhance story text:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const resetState = () => {
    if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
    }
    setMode('text');
    setTextContent('');
    setBackgroundColor(backgroundOptions[0]);
    
    setImageFile(null);
    setImagePreview(null);
    setCaption('');
    setIsUploading(false);
    setUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };
  
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    setUploadError(null);
    if (mode === 'text' && textContent.trim()) {
      onAddStory({ type: 'text', content: textContent, backgroundColor });
      handleClose();
    } else if (mode === 'image' && imageFile && user) {
        setIsUploading(true);
        try {
            const publicUrl = await uploadMedia(imageFile, 'stories', user.id);
            onAddStory({ type: 'image', content: publicUrl, caption });
            handleClose();
        } catch(error: any) {
            console.error("Failed to upload story image:", error);
            if (error.message && error.message.includes('security policy')) {
                setUploadError("فشل الرفع. تحقق من سياسات RLS في Supabase للسماح بإدراج الملفات في 'stories'.");
            } else {
                setUploadError("فشل رفع الصورة. الرجاء المحاولة مرة أخرى.");
            }
        } finally {
            setIsUploading(false);
        }
    }
  };
  
  const canSubmit = (mode === 'text' && !!textContent.trim()) || (mode === 'image' && !!imageFile);
  const canEnhance = mode === 'text' && !!textContent.trim();

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-4" aria-modal="true" role="dialog">
      <div className="flex justify-between items-center text-white mb-4">
        <button onClick={handleClose} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors" aria-label="إغلاق" disabled={isUploading}>
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">إنشاء قصة</h2>
        <div className="w-10"></div>
      </div>

       <div className="flex justify-center mb-4">
        <div className="bg-slate-800 p-1 rounded-full flex space-x-1 rtl:space-x-reverse">
          <button 
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
            disabled={isUploading}
          >
            نص
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
            disabled={isUploading}
          >
            صورة
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden relative bg-slate-800">
        {mode === 'text' ? (
            <div className={`w-full h-full flex items-center justify-center p-4 ${backgroundColor}`}>
                <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="ابدأ الكتابة"
                    className="w-full h-1/2 bg-transparent text-white text-3xl font-bold text-center resize-none focus:outline-none placeholder-white placeholder-opacity-70"
                />
            </div>
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                {imagePreview ? (
                    <img src={imagePreview} alt="معاينة القصة" className="w-full h-full object-contain" />
                ) : (
                    <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center text-slate-400 hover:text-white transition-colors" disabled={isUploading}>
                        <PhotoIcon className="w-16 h-16" />
                        <span className="mt-2 font-semibold">اختر صورة</span>
                    </button>
                )}
                <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                         <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                         <p className="mt-4">جاري الرفع...</p>
                    </div>
                )}
            </div>
        )}
      </div>
      
      <div className="flex flex-col justify-end pt-4" style={{minHeight: '8rem'}}>
        {uploadError && (
             <div className="mb-4 p-3 text-sm text-center text-red-700 bg-red-100 rounded-md">
                 {uploadError}
             </div>
        )}

        {mode === 'text' ? (
            <div className="space-y-4">
                <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
                    {backgroundOptions.map(bg => (
                        <button key={bg} onClick={() => setBackgroundColor(bg)} className={`w-8 h-8 rounded-full ${bg} border-2 ${backgroundColor === bg ? 'border-white' : 'border-transparent'}`} aria-label={`Select ${bg} background`}></button>
                    ))}
                </div>
                <div className="flex justify-between items-center">
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
                        <span>تحسين</span>
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        نشر القصة
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col space-y-4">
                 {imagePreview && !isUploading && (
                    <input 
                        type="text" 
                        value={caption} 
                        onChange={(e) => setCaption(e.target.value)} 
                        placeholder="أضف تعليقاً..."
                        className="w-full p-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                 )}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isUploading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUploading ? 'جاري النشر...' : 'نشر القصة'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryCreatorModal;
