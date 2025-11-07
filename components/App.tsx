import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './AuthPage';
import MainLayout from './MainLayout';
import EnvironmentChecker from './EnvironmentChecker';

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
     return <EnvironmentChecker error={authError} />;
   }

  return session ? <MainLayout /> : <AuthPage />;
};

export default App;