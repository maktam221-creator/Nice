import React, { useState } from 'react';
import { supabase } from '../contexts/services/supabaseService';
import { uploadFile } from '../contexts/services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { generateSteps } from '../contexts/services/geminiService';
import { SparklesIcon } from './Icons';

type CreatePostProps = {
  onClose: () => void;
  onPostCreated: () => void;
};

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const { profile } = useAuth();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Mode State
  const [mode, setMode] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleGenerateSteps = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generatedCaption = await generateSteps(aiPrompt);
      setCaption(generatedCaption);
      setMode('upload'); // Switch back to upload mode to see the result
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileUrl = await uploadFile(file, `posts/${profile.id}/${Date.now()}_${file.name}`);
      
      const postData: {
        user_id: string;
        caption: string;
        image_url?: string;
        video_url?: string;
      } = {
        user_id: profile.id,
        caption: caption,
      };

      if (file.type.startsWith('image/')) {
        postData.image_url = fileUrl;
      } else if (file.type.startsWith('video/')) {
        postData.video_url = fileUrl;
      }

      const { error: insertError } = await supabase.from('posts').insert(postData);

      if (insertError) {
        throw insertError;
      }

      onPostCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'فشل في إنشاء المنشور. يرجى التحقق من سياسات RLS في Supabase لجداول \'posts\' وتخزين الملفات.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadMode = () => (
     <form onSubmit={handleSubmit}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-center flex-1">إنشاء منشور جديد</h3>
          <button type="submit" className="text-indigo-600 font-semibold disabled:opacity-50" disabled={isUploading || !file}>
            {isUploading ? 'جاري النشر...' : 'نشر'}
          </button>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 max-h-[70vh]">
            <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 rounded-lg aspect-square">
              {preview ? (
                file?.type.startsWith('video/') ? (
                  <video src={preview} controls className="max-h-full max-w-full rounded-lg" />
                ) : (
                  <img src={preview} alt="preview" className="max-h-full max-w-full rounded-lg" />
                )
              ) : (
                <div className="text-center p-4">
                   <label htmlFor="file-upload" className="cursor-pointer bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition">
                      اختر من جهازك
                   </label>
                   <input id="file-upload" type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="w-full h-48 bg-slate-50 border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                required
              />
               <button type="button" onClick={() => setMode('ai')} className="mt-2 flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800">
                <SparklesIcon className="w-5 h-5" />
                إنشاء بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        </div>
      </form>
  );

  const renderAiMode = () => (
     <div>
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold text-center">إنشاء بالذكاء الاصطناعي</h3>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600">اكتب الموضوع الذي تريد إنشاء دليل إرشادي له. مثلاً: "طريقة عمل القهوة المقطرة".</p>
          <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="أدخل موضوعك هنا..."
              className="w-full h-24 bg-slate-50 border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setMode('upload')} className="py-2 px-4 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              إلغاء
            </button>
             <button onClick={handleGenerateSteps} disabled={isGenerating || !aiPrompt.trim()} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2">
               <SparklesIcon className="w-5 h-5" />
               {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الخطوات'}
            </button>
          </div>
        </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg" onClick={e => e.stopPropagation()}>
         {mode === 'upload' ? renderUploadMode() : renderAiMode()}
         {error && <p className="text-red-500 text-sm p-4 pt-0">{error}</p>}
      </div>
    </div>
  );
};

export default CreatePost;