

import React, { useState } from 'react';
import { enhancePost } from '../contexts/services/geminiService';
import { SparklesIcon, XIcon } from './Icons';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStory: (storyData: { type: 'text'; content: string; backgroundColor?: string; }) => void;
}

const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({ isOpen, onClose, onAddStory }) => {
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('bg-gradient-to-br from-purple-500 to-indigo-600');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const backgroundOptions = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-green-400 to-blue-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-slate-700 to-slate-900',
  ];

  if (!isOpen) return null;

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
    setTextContent('');
    setBackgroundColor(backgroundOptions[0]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = () => {
    if (textContent.trim()) {
      onAddStory({ type: 'text', content: textContent, backgroundColor });
    }
    handleClose();
  };
  
  const canSubmit = !!textContent.trim();
  const canEnhance = !!textContent.trim();

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-4" aria-modal="true" role="dialog">
      {/* Header */}
      <div className="flex justify-between items-center text-white mb-4">
        <button onClick={handleClose} className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors" aria-label="إغلاق">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">إنشاء قصة نصية</h2>
        <div className="w-10"></div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden relative bg-slate-800">
        <div className={`w-full h-full flex items-center justify-center p-4 ${backgroundColor}`}>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="ابدأ الكتابة"
            className="w-full h-1/2 bg-transparent text-white text-3xl font-bold text-center resize-none focus:outline-none placeholder-white placeholder-opacity-70"
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4">
        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse mb-4">
            {backgroundOptions.map(bg => (
                <button key={bg} onClick={() => setBackgroundColor(bg)} className={`w-8 h-8 rounded-full ${bg} border-2 ${backgroundColor === bg ? 'border-white' : 'border-transparent'}`}></button>
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
    </div>
  );
};

export default StoryCreatorModal;