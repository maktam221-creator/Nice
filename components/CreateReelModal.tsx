
import React, { useState, useRef } from 'react';
import { XIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../contexts/services/supabaseService';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReel: (videoUrl: string, caption: string) => void;
}

const CreateReelModal: React.FC<CreateReelModalProps> = ({ isOpen, onClose, onAddReel }) => {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const resetState = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setCaption('');
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  }

  const handleSubmit = async () => {
    if (!videoFile || !user) return;

    setIsUploading(true);
    setUploadError(null);
    try {
        const publicUrl = await uploadMedia(videoFile, 'reels', user.id);
        onAddReel(publicUrl, caption);
        handleClose();
    } catch(error: any) {
        console.error("Failed to upload reel:", error);
        if (error.message && error.message.includes('security policy')) {
            setUploadError("فشل الرفع. تحقق من سياسات RLS في Supabase للسماح بإدراج الملفات في 'reels'.");
        } else {
            setUploadError("فشل رفع الفيديو. الرجاء المحاولة مرة أخرى.");
        }
        setIsUploading(false);
    }
  };
  
  React.useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);


  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-90 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-xl font-bold text-slate-800">نشر فيديو جديد</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {isUploading ? (
            <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg text-slate-600">جاري نشر الفيديو...</p>
                <p className="text-sm text-slate-500">قد يستغرق هذا بعض الوقت.</p>
            </div>
        ) : (
          <div className="space-y-4">
            {!videoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <p>انقر هنا لاختيار فيديو</p>
                <p className="text-sm mt-1">(الحد الأقصى 50 ميجا)</p>
              </div>
            ) : (
              <div className="w-full bg-slate-100 rounded-lg overflow-hidden">
                <video src={videoPreview} controls className="w-full max-h-80" />
              </div>
            )}
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="video/*"
            />
            
            {uploadError && (
              <div className="p-3 text-sm text-center text-red-700 bg-red-100 rounded-md">
                {uploadError}
              </div>
            )}

            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-slate-700 mb-1">
                الوصف
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                placeholder="اكتب وصفاً للفيديو..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={!videoFile || isUploading}
                className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
              >
                نشر
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReelModal;
