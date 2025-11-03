import React from 'react';
import { User } from '../types';
import { PlusIcon } from './Icons';

interface StoryGroup {
  user: User;
  hasUnviewed: boolean;
}

interface StoriesTrayProps {
  storyGroups: StoryGroup[];
  currentUser: User;
  onViewStories: (userUid: string) => void;
  onAddStory: () => void;
}

const StoriesTray: React.FC<StoriesTrayProps> = ({ storyGroups, currentUser, onViewStories, onAddStory }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse overflow-x-auto pb-2 -mb-2">
        {/* Add Story Button */}
        <div className="flex flex-col items-center space-y-1 flex-shrink-0 w-20">
          <button onClick={onAddStory} className="relative w-16 h-16 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <img src={currentUser.avatarUrl} alt="قصتك" className="w-full h-full rounded-full object-cover" />
            <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
          </button>
          <span className="text-xs text-slate-600 font-medium">قصتك</span>
        </div>
        
        {/* Friends' Stories */}
        {storyGroups.map(({ user, hasUnviewed }) => {
            return (
              <div key={user.uid} className="flex flex-col items-center space-y-1 flex-shrink-0 w-20">
                <button onClick={() => onViewStories(user.uid)} className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 disabled:from-slate-200 disabled:via-slate-300 disabled:to-slate-400">
                  <div className="bg-white p-0.5 rounded-full">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                </button>
                <span className="text-xs text-slate-600 truncate w-full text-center">{user.name}</span>
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default StoriesTray;