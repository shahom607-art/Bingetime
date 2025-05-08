import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuthInstance, db as firebaseDbInstance } from './config'; // Aliased imports
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import type { Media } from '@/services/tmdb';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  if (!firebaseAuthInstance || !firebaseDbInstance) {
    console.error("Firebase Auth or Firestore not initialized. Cannot sign in with Google.");
    throw new Error("Firebase not configured. Sign-in unavailable.");
  }
  try {
    const result = await signInWithPopup(firebaseAuthInstance, provider);
    const user = result.user;
    if (user) {
      const userRef = doc(firebaseDbInstance, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          totalWatchTime: 0,
          watchList: [],
        };
        await setDoc(userRef, { ...newUserProfile, createdAt: serverTimestamp() });
        return newUserProfile;
      } else {
        const firestoreData = userSnap.data();
        return {
          uid: user.uid,
          displayName: firestoreData.displayName || user.displayName,
          email: firestoreData.email || user.email,
          photoURL: firestoreData.photoURL || user.photoURL,
          totalWatchTime: firestoreData.totalWatchTime || 0,
          watchList: (firestoreData.watchList as Media[] || []),
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    // Check if the error is due to popup being blocked, or other common issues
    if ((error as any).code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in popup was closed. Please try again.");
    }
    throw error; // Re-throw other errors
  }
};

export const signOut = async (): Promise<void> => {
  if (!firebaseAuthInstance) {
    console.error("Firebase Auth not initialized. Cannot sign out.");
    // Depending on desired behavior, could throw or just log
    return; // Silently fail if auth not ready, or throw new Error("Firebase not configured.");
  }
  try {
    await firebaseSignOut(firebaseAuthInstance);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
