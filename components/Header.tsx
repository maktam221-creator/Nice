
import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import { SearchIcon, BellIcon, UserCircleIcon, XCircleIcon } from './Icons';
import NotificationsPanel from './Notifications';

interface HeaderProps {
    currentUser: User;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    notifications: Notification[];
    unreadNotificationCount: number;
    onViewProfile: (user: User) => void;
    onGoToHome: () => void;
    onNotificationNavigate: (notification: Notification) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, searchQuery, onSearchChange, notifications, unreadNotificationCount, onViewProfile, onGoToHome, onNotificationNavigate }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const handleNotificationClick = (notification: Notification) => {
        onNotificationNavigate(notification);
        setIsNotificationsOpen(false);
    }

    return (
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Title */}
                    <button onClick={onGoToHome} className="text-2xl font-bold text-indigo-600">
                        Maydan
                    </button>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden sm:flex items-center relative w-full max-w-md mx-4">
                        <SearchIcon className="absolute right-3 rtl:right-auto rtl:left-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن منشورات أو مستخدمين..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-slate-100 border border-transparent rounded-full py-2 pr-10 rtl:pr-4 rtl:pl-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                         {searchQuery && (
                            <button onClick={() => onSearchChange('')} className="absolute left-3 rtl:left-auto rtl:right-3 p-1">
                                <XCircleIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                            </button>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="relative" ref={notificationsRef}>
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <BellIcon className="w-6 h-6 text-slate-600" />
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute top-0 right-0 flex justify-center items-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </button>
                            {isNotificationsOpen && (
                                <NotificationsPanel
                                    notifications={notifications}
                                    onClose={() => setIsNotificationsOpen(false)}
                                    onNavigate={handleNotificationClick}
                                />
                            )}
                        </div>
                        <button onClick={() => onViewProfile(currentUser)} className="p-2 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
                            <UserCircleIcon className="w-6 h-6 text-slate-600" />
                        </button>
                        <button onClick={() => onViewProfile(currentUser)} className="sm:hidden">
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
