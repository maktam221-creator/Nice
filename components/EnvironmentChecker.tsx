import React from 'react';

// These are the variables the application depends on.
// The values are the placeholder strings used in the config files, which indicate they haven't been set.
const VAR_DETAILS: Record<string, { placeholder?: string; service: string; link: string; description: string; }> = {
    'API_KEY': { service: 'Google AI', link: 'https://aistudio.google.com/app/apikey', description: 'مطلوب لميزات الذكاء الاصطناعي (مثل تحسين المنشورات).' },
};

const missingVars = Object.keys(VAR_DETAILS).filter(key => {
    const value = process.env[key];
    const placeholder = VAR_DETAILS[key].placeholder;
    // A variable is considered missing if it's not present,
    // or if it matches its placeholder value.
    return !value || (placeholder && value === placeholder);
});

export const EnvironmentChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (missingVars.length > 0) {
    return (
      <div className="fixed inset-0 bg-slate-100 z-[100] flex items-center justify-center p-4 font-[sans-serif]">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full border-t-4 border-amber-500">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">خطوة أخيرة لإعداد تطبيقك!</h1>
          <p className="text-slate-600 mb-6">
            لكي يعمل تطبيق "ميدان" بشكل كامل، بما في ذلك تسجيل الدخول ورفع الصور وميزات الذكاء الاصطناعي، يحتاج إلى الربط ببعض الخدمات الخارجية. للقيام بذلك، يجب إضافة "متغيرات البيئة" التالية إلى إعدادات مشروعك.
          </p>
          
          <div className="mb-6">
            <a 
              href="https://vercel.com/docs/projects/environment-variables" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-slate-800 transition-colors text-sm"
            >
              تعلم كيفية إضافة المتغيرات على Vercel
            </a>
          </div>

          <div className="border border-slate-200 rounded-md">
            <h2 className="font-semibold text-slate-800 p-3 bg-slate-50 border-b">المتغيرات المطلوبة:</h2>
            <div className="divide-y divide-slate-200">
                {missingVars.map(varName => (
                    <div key={varName} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                        <code className="font-mono text-sm text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">{varName}</code>
                        <p className="text-sm text-slate-500">{VAR_DETAILS[varName].description}</p>
                        <a 
                            href={VAR_DETAILS[varName].link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline md:text-left rtl:md:text-right"
                        >
                            الحصول على المفتاح من {VAR_DETAILS[varName].service} &rarr;
                        </a>
                    </div>
                ))}
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            بعد إضافة هذه المتغيرات، قم بإعادة نشر (re-deploy) التطبيق على Vercel لتطبيق التغييرات.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
