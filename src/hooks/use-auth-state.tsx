'use client';

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth as firebaseAuthInstance, firebaseInitializationError, db as firebaseDbInstance } from '@/lib/firebase/config';
import type { UserProfile } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import type { Media } from '@/services/tmdb';

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
    
    if (!firebaseAuthInstance || !firebaseDbInstance) {
      const configErrorMessage = "Firebase Authentication or Firestore services are not available. This could be due to missing or incomplete Firebase configuration. Please ensure all 'NEXT_PUBLIC_FIREBASE_*' environment variables are correctly set in your .env.local file, and that your Firebase app is properly configured in the Firebase console (e.g., Authentication methods enabled).";
      setError(new Error(configErrorMessage));
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseAuthInstance.onAuthStateChanged(async (firebaseUser) => {
      setError(null); 
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch profile from Firestore
        const userDocRef = doc(firebaseDbInstance, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data();
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firestoreData.displayName || firebaseUser.displayName, // Prefer Firestore, fallback to auth
            email: firestoreData.email || firebaseUser.email,
            photoURL: firestoreData.photoURL || firebaseUser.photoURL,
            totalWatchTime: firestoreData.totalWatchTime || 0,
            watchList: (firestoreData.watchList as Media[] || []),
          });
        } else {
          // This case might happen if Firestore doc creation failed or is delayed
          // Or for a user who existed before Firestore profile logic was in place
          // For new email/password users, the signup function should create this doc.
          console.warn(`Firestore document for user ${firebaseUser.uid} not found. Using auth data only.`);
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName, // Will be null for new email/pass users
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,       // Will be null for new email/pass users
            totalWatchTime: 0, 
            watchList: [], 
          });
        }
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
