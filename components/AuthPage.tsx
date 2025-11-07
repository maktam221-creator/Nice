import React, { useState } from 'react';
import { supabase } from '../contexts/services/supabaseService';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              avatar_url: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`
            }
          }
        });
        if (error) throw error;
        if(data.user && !data.session) {
             setMessage('تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه.');
        }
      }
    } catch (err: any) {
      let errorMessage = "حدث خطأ ما. يرجى المحاولة مرة أخرى.";
      if (err.message) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.";
        } else if (err.message.includes("Email not confirmed")) {
            errorMessage = "لم يتم تأكيد بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك والنقر على رابط التأكيد.";
        } else if (err.message.includes("User already registered")) {
            errorMessage = "هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          {isLogin ? 'مرحباً بعودتك!' : 'إنشاء حساب جديد'}
        </h1>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'سجل الدخول للمتابعة' : 'انضم إلينا اليوم'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-100 rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-100 rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-100 rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300"
          >
            {loading ? 'جاري...' : (isLogin ? 'تسجيل الدخول' : 'تسجيل')}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        {message && <p className="mt-4 text-center text-green-500 bg-green-100 p-3 rounded-lg">{message}</p>}

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} className="text-indigo-600 hover:underline">
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;