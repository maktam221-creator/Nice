import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase } from './services/supabaseService';
import { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  profile: User | null;
  authLoading: boolean;
  authError: string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } catch (e) {
         setAuthError("فشل في استرداد جلسة المستخدم.");
      } finally {
        setAuthLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setProfile(null);
          setAuthError(null); // Clear error on sign out
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchProfile = async (authUser: AuthUser) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
    
    // Self-healing: If profile doesn't exist, create it.
    if (error && error.code === 'PGRST116') {
      console.warn('Profile not found, creating a new one...');
      const newProfile = {
        id: authUser.id,
        username: authUser.user_metadata.username || authUser.email?.split('@')[0],
        avatar_url: authUser.user_metadata.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${authUser.email?.split('@')[0]}`,
        bio: '',
      };
      
      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        setProfile(null);
        setAuthError("حدث خطأ أثناء إعداد حسابك. الرجاء المحاولة مرة أخرى.");
      } else {
        setProfile(createdProfile);
        setAuthError(null);
      }
    } else if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
        setAuthError("لم نتمكن من تحميل ملفك الشخصي. قد تكون هناك مشكلة في الاتصال أو في إعدادات حسابك.");
    } else {
        setProfile(data);
        setAuthError(null); // Clear error on success
    }
  };


  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const value = {
    session,
    user,
    profile,
    authLoading,
    authError,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading ? children : <div className="flex justify-center items-center h-screen">جاري التحميل...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
