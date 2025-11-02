import React from 'react';
import { User } from '../types';
import { UserPlusIcon } from './Icons';

interface SidebarProps {
  currentUser: User;
  allUsers: User[];
  following: string[];
  onViewProfile: (user: User) => void;
  onFollowToggle: (userName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, allUsers, following, onViewProfile, onFollowToggle }) => {
  // Suggest users who are not the current user and are not being followed.
  const suggestions = allUsers
    .filter(user => user.name !== currentUser.name && !following.includes(user.name))
    .slice(0, 3); // Show up to 3 suggestions

  return (
    <div className="space-y-6">
      {/* Current User Profile Card */}
      <div className="bg-white p-4 rounded-lg shadow-md">
         <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">ملفك الشخصي</h3>
         <button onClick={() => onViewProfile(currentUser)} className="w-full flex items-center space-x-4 rtl:space-x-reverse group text-right">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full" />
            <div>
                <p className="font-bold text-slate-800 group-hover:underline">{currentUser.name}</p>
                <p className="text-sm text-slate-500">عرض الملف الشخصي</p>
            </div>
        </button>
      </div>

      {/* Suggestions Card */}
      {suggestions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">اقتراحات للمتابعة</h3>
          <div className="space-y-4">
            {suggestions.map(user => (
              <div key={user.name} className="flex items-center justify-between">
                <button onClick={() => onViewProfile(user)} className="flex items-center space-x-3 rtl:space-x-reverse group text-right">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 group-hover:underline">{user.name}</p>
                  </div>
                </button>
                <button
                    onClick={() => onFollowToggle(user.name)}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-3 py-1.5 text-xs font-medium rounded-full transition-colors text-white bg-indigo-600 hover:bg-indigo-700"
                    aria-label={`متابعة ${user.name}`}
                >
                    <UserPlusIcon className="w-4 h-4" />
                    <span>متابعة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
