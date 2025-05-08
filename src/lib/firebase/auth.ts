import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import type { Media } from '@/services/tmdb';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user) {
      // Check if user exists in Firestore, if not, create a new profile
      const userRef = doc(db, 'users', user.uid);
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
        // Ensure local UserProfile type matches Firestore data structure
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
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
