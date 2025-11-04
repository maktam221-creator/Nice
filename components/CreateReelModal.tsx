import React, { useState, useRef } from 'react';
import { XIcon } from './Icons';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReel: (videoUrl: string, caption: string) => void;
}

const CreateReelModal: React.FC<CreateReelModalProps> = ({ isOpen, onClose, onAddReel }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const resetState = () => {
    setVideoFile(null);
    if(videoPreview) {
        URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setCaption('');
    setIsUploading(false);
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  }

  const handleSubmit = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
        // For this demo, we'll use a placeholder URL instead of a real upload.
        const placeholderVideoUrl = 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4';
        onAddReel(placeholderVideoUrl, caption);
        handleClose();
    }, 1500);
  };

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