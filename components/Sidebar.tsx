import React from 'react';
import { HomeIcon, ProfileIcon, CreateIcon, LogoutIcon } from './Icons';
import { View } from '../types';
import { useAuth } from '../contexts/AuthContext';

type SidebarProps = {
  setView: (view: View) => void;
  currentView: View;
  onOpenCreate: () => void;
  signOut: () => void;
  currentUserId: string;
};

const Sidebar: React.FC<SidebarProps> = ({ setView, currentView, onOpenCreate, signOut, currentUserId }) => {
  
  const navItems = [
    { name: 'الرئيسية', icon: HomeIcon, page: 'feed' as const, action: () => setView({ page: 'feed' }) },
    { name: 'إنشاء', icon: CreateIcon, page: 'create' as const, action: onOpenCreate },
    { name: 'الملف الشخصي', icon: ProfileIcon, page: 'profile' as const, action: () => setView({ page: 'profile', userId: currentUserId }) },
  ];

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-white border-l border-slate-200 p-6 shadow-sm transform translate-x-0 transition-transform duration-300 z-20 hidden md:block flex flex-col">
      <div className="text-2xl font-bold text-indigo-600 mb-10">
        تطبيقنا
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map(item => {
             const isActive = item.page === 'profile' 
                ? currentView.page === 'profile' && currentView.userId === currentUserId
                : currentView.page === item.page;
             return (
                 <li key={item.name} className="mb-2">
                  <button
                    onClick={item.action}
                    className={`w-full flex items-center gap-4 p-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.name}
                  </button>
                </li>
             )
          })}
        </ul>
      </nav>
       <div className="mt-auto">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 p-3 rounded-lg text-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors duration-200"
          >
            <LogoutIcon className="w-6 h-6" />
            تسجيل الخروج
          </button>
        </div>
    </aside>
  );
};

export default Sidebar;