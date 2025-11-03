import React from 'react';
import { HomeIcon, SearchIcon, BellIcon, UserIcon, ChatBubbleLeftRightIcon } from './Icons';
import { User } from '../types';

type Page = 'home' | 'profile' | 'chat';

interface BottomNavBarProps {
    currentPage: Page;
    searchQuery: string;
    viewedProfileUser: User | null;
    currentUser: User;
    unreadCount: number;
    onHomeClick: () => void;
    onSearchClick: () => void;
    onNotificationsClick: () => void;
    onProfileClick: () => void;
    onChatClick: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
    currentPage, 
    searchQuery, 
    viewedProfileUser, 
    currentUser, 
    unreadCount, 
    onHomeClick, 
    onSearchClick, 
    onNotificationsClick, 
    onProfileClick,
    onChatClick
}) => {
    
    const navItems = [
        { name: 'الرئيسية', icon: HomeIcon, action: onHomeClick, active: currentPage === 'home' && !searchQuery },
        { name: 'بحث', icon: SearchIcon, action: onSearchClick, active: !!searchQuery },
        { name: 'الدردشات', icon: ChatBubbleLeftRightIcon, action: onChatClick, active: currentPage === 'chat' },
        { name: 'الإشعارات', icon: BellIcon, action: onNotificationsClick, active: false, badge: unreadCount },
        { name: 'ملفي', icon: UserIcon, action: onProfileClick, active: currentPage === 'profile' && viewedProfileUser?.name === currentUser.name },
    ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-40">
      <div className="max-w-6xl mx-auto flex justify-around">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={item.action}
            className="flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-xs font-medium transition-colors group focus:outline-none"
            aria-label={item.name}
          >
            <div className="relative">
              <item.icon className={`w-7 h-7 mb-1 transition-colors ${item.active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-500'}`} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex justify-center items-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`transition-colors ${item.active ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500'}`}>
                {item.name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
