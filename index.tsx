import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Components ---

const SparklesIcon: React.FC<{ className?: string; }> = ({ className }) => (
    <svg xmlns="http://www.w.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.528L16.5 21.75l-.398-1.222a3.375 3.375 0 00-2.455-2.455L12.75 18l1.222-.398a3.375 3.375 0 002.455-2.455L16.5 14.25l.398 1.222a3.375 3.375 0 002.456 2.455L21 18l-1.222.398a3.375 3.375 0 00-2.456 2.455z" />
    </svg>
);

const Loader: React.FC = () => (
    <div className="flex justify-center items-center gap-2">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>جاري الإنشاء...</span>
    </div>
);

// App Component
const App: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [story, setStory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateStory = async () => {
        if (!topic.trim()) {
            setError("الرجاء إدخال موضوع لإنشاء قصة عنه.");
            return;
        }
        setLoading(true);
        setError(null);
        setStory('');

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `اكتب قصة قصيرة ومبتكرة باللغة العربية حول "${topic}". اجعلها مشوقة ومناسبة لجميع الأعمار.`,
            });
            setStory(response.text);
        } catch (err) {
            console.error("Error generating story:", err);
            setError("عذراً، حدث خطأ أثناء إنشاء القصة. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">
                <header className="text-center space-y-4">
                    <SparklesIcon className="w-12 h-12 mx-auto text-purple-300" />
                    <h1 className="text-3xl sm:text-4xl font-bold">مولّد القصص بالذكاء الاصطناعي</h1>
                    <p className="text-slate-300">حوّل أفكارك إلى قصص رائعة ببضع نقرات!</p>
                </header>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="أدخل موضوع القصة هنا... (مثال: رائد فضاء ضائع)"
                        className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/20 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                        disabled={loading}
                    />
                    <button
                        onClick={generateStory}
                        disabled={loading}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                    >
                        {loading ? <Loader /> : <> <SparklesIcon className="w-5 h-5" /> <span>أنشئ القصة</span> </>}
                    </button>
                </div>

                {error && <p className="text-center text-red-300 bg-red-500/20 p-3 rounded-lg">{error}</p>}

                {story && (
                    <div className="bg-black/20 p-4 sm:p-6 rounded-lg border border-white/10 animate-fade-in">
                        <h2 className="text-xl font-bold text-slate-100 mb-3">قصتك:</h2>
                        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{story}</p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate