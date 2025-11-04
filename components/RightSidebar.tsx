import React from 'react';
import { User } from '../types';

interface RightSidebarProps {
  followingUsers: User[];
  onViewProfile: (user: User) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ followingUsers, onViewProfile }) => {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Following List Card */}
      {followingUsers.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">تتابعهم</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {followingUsers.map(user => (
              <div key={user.uid} className="flex items-center justify-between">
                <button onClick={() => onViewProfile(user)} className="flex items-center space-x-3 rtl:space-x-reverse group text-right">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 group-hover:underline">{user.name}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Footer or ads */}
       <div className="text-xs text-slate-400 space-x-2 rtl:space-x-reverse text-center">
            <a href="#" className="hover:underline">حول</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">مساعدة</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">خصوصية</a>
            <span>&middot;</span>
            <a href="#" className="hover:underline">شروط</a>
       </div>
    </div>
  );
};

export default RightSidebar;
