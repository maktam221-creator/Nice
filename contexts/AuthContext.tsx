
import React, { useContext, useState, useEffect, createContext, ReactNode } from "react";
import { auth } from "./services/firebaseConfig";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signup: typeof createUserWithEmailAndPassword;
  login: typeof signInWithEmailAndPassword;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string): Promise<any> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set a default display name based on the email
    await updateProfile(userCredential.user, {
        displayName: email.split('@')[0],
        photoURL: `https://picsum.photos/seed/${userCredential.user.uid}/100/100`
    });
    return userCredential;
  }
  
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
