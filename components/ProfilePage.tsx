import React, { useState, useEffect, useCallback } from 'react';
import { User, Post, View } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/services/supabaseService';
import { HeartIcon } from './Icons';

type ProfilePageProps = {
  userId: string;
  setView: (view: View) => void;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, setView }) => {
  const { profile: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    // setLoading(true); // Keep UI stable during real-time updates
    setError(null);
    try {
      const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();
      const postsPromise = supabase.from('posts').select('*, likes(user_id)').eq('user_id', userId).order('created_at', { ascending: false });
      const followersPromise = supabase.from('followers').select('*', { count: 'exact' }).eq('following_id', userId);
      const followingPromise = supabase.from('followers').select('*', { count: 'exact' }).eq('follower_id', userId);
      const isFollowingPromise = currentUser ? supabase.from('followers').select('*').eq('follower_id', currentUser.id).eq('following_id', userId) : Promise.resolve({ data: [], error: null, count: null });

      const [
        { data: profileData, error: profileError },
        { data: postsData, error: postsError },
        { count: followersCount, error: followersError },
        { count: followingCount, error: followingError },
        { data: isFollowingData, error: isFollowingError }
      ] = await Promise.all([profilePromise, postsPromise, followersPromise, followingPromise, isFollowingPromise]);
      
      // Essential data - throw error if it fails
      if (profileError) throw profileError;
      if (postsError) throw postsError;

      // Optional data - handle gracefully by logging a warning and defaulting to 0/false
      if (followersError) {
        console.warn("Could not fetch followers count. This may be due to a missing 'followers' table or RLS policies.", followersError);
      }
      if (followingError) {
        console.warn("Could not fetch following count.", followingError);
      }
      if (isFollowingError) {
        console.warn("Could not fetch following status.", isFollowingError);
      }

      if(profileData) {
        setUser({
          ...profileData,
          postsCount: postsData?.length || 0,
          // Default to 0 or false if there was an error
          followersCount: followersError ? 0 : followersCount || 0,
          followingCount: followingError ? 0 : followingCount || 0,
          isFollowing: isFollowingError ? false : (isFollowingData?.length ?? 0) > 0
        });
      }
      if(postsData) {
        setPosts(postsData as Post[]);
      }

    } catch (err: any) {
      console.error("Error fetching profile data:", err);
      setError("فشل تحميل الملف الشخصي. يرجى التحقق من سياسات RLS في Supabase. تأكد من وجود سياسات تسمح بقراءة جداول 'profiles', 'posts', و 'followers'.");
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfileData();

    const followerSubscription = supabase
      .channel(`followers-for-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'followers', filter: `following_id=eq.${userId}`}, fetchProfileData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'followers', filter: `follower_id=eq.${userId}`}, fetchProfileData)
      .subscribe();

    return () => {
      supabase.removeChannel(followerSubscription);
    };
  }, [userId, fetchProfileData]);
  
  const handleFollowToggle = async () => {
    if (!currentUser || !user || currentUser.id === user.id) return;
    
    // Optimistic UI update
    setUser(prevUser => prevUser ? ({
        ...prevUser,
        isFollowing: !prevUser.isFollowing,
        followersCount: prevUser.isFollowing 
            ? (prevUser.followersCount || 1) - 1 
            : (prevUser.followersCount || 0) + 1
    }) : null);

    if (user.isFollowing) {
        // Unfollow
        await supabase.from('followers').delete().match({ follower_id: currentUser.id, following_id: user.id });
    } else {
        // Follow
        await supabase.from('followers').insert({ follower_id: currentUser.id, following_id: user.id });
    }
  };


  if (loading) return <div className="text-center p-10">جاري تحميل الملف الشخصي...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center p-10">لم يتم العثور على المستخدم.</div>;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row items-center gap-8 mb-10">
        <img
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-200"
          src={user.avatar_url}
          alt={user.username}
        />
        <div className="text-center sm:text-right flex-1">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
            <h1 className="text-3xl font-bold">{user.username}</h1>
             {!isOwnProfile && (
                <button 
                  onClick={handleFollowToggle}
                  className={`px-4 py-1.5 rounded-lg font-semibold ${user.isFollowing ? 'bg-slate-200 text-slate-800' : 'bg-indigo-600 text-white'}`}>
                  {user.isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                </button>
             )}
          </div>
          <div className="flex justify-center sm:justify-start gap-6 mt-4 text-center">
            <div>
              <span className="font-bold block text-lg">{posts.length}</span>
              <span className="text-slate-500 text-sm">منشورات</span>
            </div>
            <div>
              <span className="font-bold block text-lg">{user.followersCount?.toLocaleString() || 0}</span>
              <span className="text-slate-500 text-sm">متابعون</span>
            </div>
            <div>
              <span className="font-bold block text-lg">{user.followingCount?.toLocaleString() || 0}</span>
              <span className="text-slate-500 text-sm">يتابع</span>
            </div>
          </div>
           <p className="text-slate-600 mt-4">{user.bio || 'لا يوجد نبذة شخصية'}</p>
        </div>
      </header>

      <hr className="my-8 border-slate-200" />

      <main>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-4">
          {posts.map(post => (
            <div key={post.id} className="relative aspect-square group cursor-pointer">
              {post.image_url && <img src={post.image_url} alt="post" className="w-full h-full object-cover rounded-md" />}
               {post.video_url && (
                <video className="w-full h-full object-cover rounded-md bg-black">
                  <source src={post.video_url} type="video/mp4" />
                </video>
               )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center text-white text-lg font-bold opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-2">
                   <HeartIcon className="w-6 h-6 fill-current" /> {post.likes.length}
                </span>
              </div>
            </div>
          ))}
           {posts.length === 0 && <p className="text-center text-slate-500 col-span-3">لا توجد منشورات لعرضها.</p>}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;