'use client';

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth as firebaseAuthInstance, firebaseInitializationError } from '@/lib/firebase/config';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    if (firebaseInitializationError) {
      setError(firebaseInitializationError);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }
    
    if (!firebaseAuthInstance) {
      setError(new Error("Firebase Authentication services are not available. This could be due to missing or incomplete Firebase configuration. Please ensure all 'NEXT_PUBLIC_FIREBASE_*' environment variables are correctly set in your .env.local file, and that your Firebase app is properly configured in the Firebase console (e.g., Authentication methods enabled)."));
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseAuthInstance.onAuthStateChanged(async (firebaseUser) => {
      setError(null); // Clear previous errors on successful listener setup
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          totalWatchTime: 0, 
          watchList: [], 
        };
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firebase Auth state change error:", err);
      setError(err); // Set specific Firebase error from onAuthStateChanged
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthState = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};
