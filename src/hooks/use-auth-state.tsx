'use client';

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth as firebaseAuthInstance } from '@/lib/firebase/config'; // Aliased import
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Extended user profile from Firestore
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
    if (!firebaseAuthInstance) {
      console.warn('Firebase Auth is not initialized. User authentication will not work. Check Firebase configuration.');
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      setError(new Error("Firebase Auth not available. Please check your Firebase project configuration in .env.local."));
      return () => {}; // Return an empty function for cleanup
    }

    setLoading(true); // Reset loading state if firebaseAuthInstance is available
    const unsubscribe = firebaseAuthInstance.onAuthStateChanged(async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        // In a real app, you'd fetch the userProfile from Firestore here
        // For now, we'll create a mock profile based on the firebaseUser
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
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // firebaseAuthInstance is stable, no need to add to deps if it doesn't change after initial load

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
