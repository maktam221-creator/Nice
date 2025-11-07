import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './AuthPage';
import MainLayout from './MainLayout';

const App: React.FC = () => {
  const { session, authLoading, authError } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-indigo-600 mb-4 animate-pulse">
            ميدان
            </h1>
            <p className="text-xl text-slate-600">
                جاري التحميل...
            </p>
        </div>
      </div>
    );
  }
  
   if (authError) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-2">حدث خطأ</h2>
                <p className="text-slate-600">{authError}</p>
                 <p className="text-xs text-slate-400 mt-4">قد يكون هذا بسبب سياسات أمان قاعدة البيانات (RLS). يرجى مراجعة إعدادات Supabase.</p>
            </div>
        </div>
     )
   }

  return session ? <MainLayout /> : <AuthPage />;
};

export default App;