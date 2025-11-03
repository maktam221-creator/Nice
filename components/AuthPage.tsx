
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleFirebaseError = (err: any) => {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case 'auth/invalid-email':
                return 'البريد الإلكتروني غير صالح.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            case 'auth/email-already-in-use':
                return 'هذا البريد الإلكتروني مستخدم بالفعل.';
            case 'auth/weak-password':
                return 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
            default:
                return 'حدث خطأ ما. يرجى المحاولة مرة أخرى.';
        }
    }
    return 'حدث خطأ غير متوقع.';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين.');
        setLoading(false);
        return;
      }
      try {
        await signup(email, password);
        // No need to navigate, AuthProvider will handle state change
      } catch (err) {
        setError(handleFirebaseError(err));
      }
    } else {
      try {
        await login(email, password);
      } catch (err) {
        setError(handleFirebaseError(err));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-indigo-600 text-center mb-6">Maydan</h1>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex border-b mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-lg font-semibold text-center transition-colors ${mode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 text-lg font-semibold text-center transition-colors ${mode === 'signup' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
            >
              حساب جديد
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                )}
            </div>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
