import React, { useState, useEffect } from 'react';
import { supabase } from '../contexts/services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { User, View } from '../types';

type RightSidebarProps = {
  setView: (view: View) => void;
};

const RightSidebar: React.FC<RightSidebarProps> = ({ setView }) => {
  const { user: currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        // Fetch IDs of users the current user is already following
        const { data: followingData, error: followingError } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (followingError) throw followingError;

        const followingIds = followingData.map(f => f.following_id);
        const excludedIds = [...followingIds, currentUser.id];

        // Fetch profiles, excluding the current user and those they already follow
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${excludedIds.join(',')})`)
          .limit(5);

        if (usersError) throw usersError;

        setSuggestions(usersData || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentUser]);
  
  const handleFollow = async (userIdToFollow: string) => {
    if (!currentUser) return;
    
    // Optimistic UI update
    setSuggestions(prev => prev.filter(s => s.id !== userIdToFollow));

    const { error } = await supabase.from('followers').insert({ 
        follower_id: currentUser.id, 
        following_id: userIdToFollow 
    });

    if (error) {
        console.error("Error following user:", error);
        // In a real app, you might want to revert the UI change here
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 p-6 z-10 hidden xl:flex flex-col">
        <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-4">اقتراحات لك</h3>
            {loading ? (
                <p className="text-sm text-slate-500">جاري التحميل...</p>
            ) : suggestions.length > 0 ? (
            <ul className="space-y-4">
                {suggestions.map(user => (
                <li key={user.id} className="flex items-center justify-between">
                    <button onClick={() => setView({ page: 'profile', userId: user.id })} className="flex items-center gap-3 group">
                    <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-sm group-hover:underline">{user.username}</p>
                        <p className="text-xs text-slate-500">مقترح لك</p>
                    </div>
                    </button>
                    <button 
                    onClick={() => handleFollow(user.id)}
                    className="text-indigo-600 font-bold text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                    متابعة
                    </button>
                </li>
                ))}
            </ul>
            ) : (
                <p className="text-sm text-slate-500 text-center py-4">لا توجد اقتراحات حالياً.</p>
            )}
        </div>
        <footer className="text-xs text-slate-400 mt-auto text-center">
            &copy; {new Date().getFullYear()} Meydan
        </footer>
    </aside>
  );
};

export default RightSidebar;