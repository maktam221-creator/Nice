import React, { useState } from 'react';
import { CopyIcon, CheckIcon, DatabaseIcon, StorageIcon, AlertTriangleIcon } from './Icons';

type CodeBlockProps = {
  code: string;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-slate-800 text-white rounded-lg my-2 font-mono text-sm" dir="ltr">
      <pre className="overflow-x-auto p-4 pl-14">{code.trim()}</pre>
      <button 
        onClick={copyToClipboard}
        className="absolute top-2 left-2 p-2 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors"
        aria-label="Copy code"
      >
        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
      </button>
    </div>
  );
};


const EnvironmentChecker: React.FC<{ error: string }> = ({ error }) => {

  const sqlPolicies = {
    profiles: `
-- 1. Enable RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access to profiles
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING ( true );

-- 3. Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 4. Allow users to update their own profile
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );
`,
    posts: `
-- 1. Enable RLS for posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read access to posts
CREATE POLICY "Posts are viewable by everyone."
ON public.posts FOR SELECT
USING ( true );

-- 3. Allow authenticated users to insert posts
CREATE POLICY "Authenticated users can create posts."
ON public.posts FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

-- 4. Allow users to update their own posts
CREATE POLICY "Users can update their own posts."
ON public.posts FOR UPDATE
USING ( auth.uid() = user_id );

-- 5. Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts."
ON public.posts FOR DELETE
USING ( auth.uid() = user_id );
`,
    likes: `
-- Enable RLS for likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view likes" ON public.likes FOR SELECT USING (true);

-- Allow users to insert their own likes
CREATE POLICY "Users can insert their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);
`,
    comments: `
-- Enable RLS for comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view comments" ON public.comments FOR SELECT USING (true);

-- Allow users to insert their own comments
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
`,
    followers: `
-- Enable RLS for followers table
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view follower relationships" ON public.followers FOR SELECT USING (true);

-- Allow users to follow others
CREATE POLICY "Users can insert their own follow" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Allow users to unfollow
CREATE POLICY "Users can delete their own follow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);
`,
    storage: `
-- 1. Public access for viewing media files
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- 2. Authenticated users can upload files to the 'media' bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media' AND auth.role() = 'authenticated' );

-- 3. Users can update their own files in the 'media' bucket
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media' AND auth.uid() = owner );

-- 4. Users can delete their own files in the 'media' bucket
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media' AND auth.uid() = owner );
`
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-200 pb-6 mb-6">
                 <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangleIcon className="w-8 h-8 text-red-600" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-bold text-slate-800 text-center sm:text-right">يبدو أن هناك مشكلة في الإعداد</h1>
                    <p className="text-slate-600 mt-1 text-center sm:text-right">لإصلاح التطبيق، يرجى اتباع خطوات الإعداد التالية في لوحة تحكم Supabase.</p>
                 </div>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Step 1: Database RLS */}
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-3 mb-2">
                        <DatabaseIcon className="w-6 h-6 text-indigo-500" />
                        الخطوة 1: إعدادات أمان قاعدة البيانات (RLS)
                    </h2>
                    <p className="text-slate-600">
                        يبدو أن سياسات أمان قاعدة البيانات (Row Level Security) غير مفعلة أو غير مكتملة. هذه السياسات ضرورية لحماية بيانات المستخدمين.
                        اذهب إلى <span className="font-bold">SQL Editor</span> في مشروع Supabase الخاص بك وقم بتنفيذ الأكواد التالية.
                    </p>
                    
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="font-semibold">1. جدول <code className="bg-slate-100 p-1 rounded">profiles</code></h3>
                            <CodeBlock code={sqlPolicies.profiles} />
                        </div>
                         <div>
                            <h3 className="font-semibold">2. جدول <code className="bg-slate-100 p-1 rounded">posts</code></h3>
                            <CodeBlock code={sqlPolicies.posts} />
                        </div>
                         <div>
                            <h3 className="font-semibold">3. جدول <code className="bg-slate-100 p-1 rounded">likes</code></h3>
                            <CodeBlock code={sqlPolicies.likes} />
                        </div>
                         <div>
                            <h3 className="font-semibold">4. جدول <code className="bg-slate-100 p-1 rounded">comments</code></h3>
                            <CodeBlock code={sqlPolicies.comments} />
                        </div>
                         <div>
                            <h3 className="font-semibold">5. جدول <code className="bg-slate-100 p-1 rounded">followers</code></h3>
                            <CodeBlock code={sqlPolicies.followers} />
                        </div>
                    </div>
                </div>

                {/* Step 2: Storage Policies */}
                <div>
                     <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-3 mb-2">
                        <StorageIcon className="w-6 h-6 text-indigo-500" />
                        الخطوة 2: إعدادات تخزين الملفات (Storage)
                    </h2>
                    <p className="text-slate-600">
                        للسماح للمستخدمين برفع الصور ومقاطع الفيديو، يجب عليك إنشاء سياسات (Policies) لسلة التخزين <code className="bg-slate-100 p-1 rounded">'media'</code>.
                        اذهب إلى <span className="font-bold">Storage &gt; Policies</span> وحدد سلة <code className="bg-slate-100 p-1 rounded">'media'</code> ثم أنشئ السياسات التالية. يمكنك أيضاً استخدام SQL.
                    </p>
                     <div className="mt-4">
                         <h3 className="font-semibold">سياسات سلة <code className="bg-slate-100 p-1 rounded">media</code></h3>
                         <CodeBlock code={sqlPolicies.storage} />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-6 mt-8 text-center">
                 <p className="text-sm text-slate-500 mb-4">بعد تنفيذ الأكواد أعلاه، قم بإعادة تحميل الصفحة.</p>
                 <button 
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300"
                 >
                    إعادة المحاولة
                 </button>
            </div>
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                <p className="text-sm text-yellow-800 text-center">
                    <span className="font-bold">الخطأ الأصلي:</span> {error}
                </p>
            </div>
        </div>
    </div>
  );
};

export default EnvironmentChecker;
