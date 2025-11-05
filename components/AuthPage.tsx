import React, { useState } from 'react';
import { supabase } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name: fullName,
            avatar_url: `https://i.pravatar.cc/150?u=${data.user.id}`,
          });
          if (profileError) throw profileError;
        }
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600">Maydan</h1>
            <p className="text-slate-500 mt-2">تواصل مع الأصدقاء وشارك عالمك.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex border-b mb-6">
                <button 
                    onClick={() => { setIsLogin(true); setError(null); }}
                    className={`flex-1 py-3 text-lg font-semibold transition-colors ${isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                >
                    تسجيل الدخول
                </button>
                <button 
                    onClick={() => { setIsLogin(false); setError(null); }}
                    className={`flex-1 py-3 text-lg font-semibold transition-colors ${!isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                >
                    إنشاء حساب
                </button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    id="fullName"
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="مثال: أحمد محمود"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="********"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                >
                  {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;