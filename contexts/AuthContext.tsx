import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import { fromProfileSnakeCase } from './services/supabaseService';

// --- Supabase Client Setup ---
const supabaseUrl = 'https://eizibjccgfblmddpynco.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemliamNjZ2ZibG1kZHB5bmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NDgxNzEsImV4cCI6MjA3NzEyNDE3MX0._SOUbqxU-5c8rrqdkz6FWnaX5LtrCnuJ_th-UrZGUdo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// -----------------------------


interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updatedProfile: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
            setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchAndSetProfile = async () => {
      if (user) {
        setLoading(true);
        // 1. Attempt to fetch the profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          // 2. Profile exists, set it
          setProfile(fromProfileSnakeCase(data));
        } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          // 3. A real error occurred during fetch
          console.error('Error fetching profile:', error.message);
          setProfile(null); // Do not proceed if profile can't be fetched
        } else {
          // 4. Profile does not exist, so create it
          const newProfileData = {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم جديد',
            avatar_url: user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfileData)
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError.message);
            // CRITICAL FIX: If profile creation fails (likely due to RLS),
            // sign out the user to prevent an inconsistent state. They will
            // be returned to the login page.
            await supabase.auth.signOut();
            setProfile(null);
          } else {
            // Set the newly created profile to state from the returned data
            setProfile(fromProfileSnakeCase(insertedData));
          }
        }
        setLoading(false);
      }
    };

    fetchAndSetProfile();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updatedProfile: User) => {
    if (!user) throw new Error("No user logged in");

    const updates = {
        id: user.id,
        name: updatedProfile.name,
        avatar_url: updatedProfile.avatarUrl,
        bio: updatedProfile.bio,
        gender: updatedProfile.gender,
        country: updatedProfile.country,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
        console.error('Error updating profile:', error.message);
        throw error;
    } else {
        setProfile(prevProfile => ({ ...prevProfile, ...updatedProfile }));
    }
  };

  const value = { session, user, profile, loading, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
