import React from 'react';
import { HomeIcon, ProfileIcon, LogoutIcon } from './Icons';
import { View } from '../types';

type BottomNavBarProps = {
  setView: (view: View) => void;
  currentView: View;
  signOut: () => void;
  currentUserId: string;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ setView, currentView, signOut, currentUserId }) => {
  const navItems = [
    { name: 'الرئيسية', icon: HomeIcon, page: 'feed' as const, action: () => setView({ page: 'feed' }) },
    { name: 'الملف الشخصي', icon: ProfileIcon, page: 'profile' as const, action: () => setView({ page: 'profile', userId: currentUserId }) },
    { name: 'الخروج', icon: LogoutIcon, page: 'logout' as const, action: signOut },
  ];

  return (
    <nav className="fixed bottom-0 right-0 w-full bg-white border-t border-slate-200 p-2 shadow-lg md:hidden z-20">
      <ul className="flex justify-around items-center">
        {navItems.map(item => {
            const isActive = item.page === 'profile' 
                ? currentView.page === 'profile' && currentView.userId === currentUserId
                : currentView.page === item.page;
           return (
             <li key={item.name}>
              <button
                onClick={item.action}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200 w-20 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-500'
                }`}
              >
                <item.icon className="w-7 h-7" />
                <span className="text-xs">{item.name}</span>
              </button>
            </li>
           )
        })}
      </ul>
    </nav>
  );
};

export default BottomNavBar;