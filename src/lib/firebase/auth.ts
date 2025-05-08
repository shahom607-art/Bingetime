import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword as firebaseSignInWithEmailPassword, 
  signOut as firebaseSignOut,
  type UserCredential
} from 'firebase/auth';
import { auth as firebaseAuthInstance, db as firebaseDbInstance } from './config'; // Aliased imports
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import type { Media } from '@/services/tmdb';


export const signUpWithEmailPassword = async (email: string, password: string): Promise<void> => {
  if (!firebaseAuthInstance || !firebaseDbInstance) {
    throw new Error("Firebase not configured. Sign-up unavailable.");
  }
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(firebaseAuthInstance, email, password);
    const user = userCredential.user;
    if (user) {
      const userRef = doc(firebaseDbInstance, 'users', user.uid);
      // Check if document already exists (should not happen for createUserWithEmailAndPassword, but good practice)
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          displayName: null, // displayName is not set by default for email/password
          email: user.email,
          photoURL: null, // photoURL is not set by default
          totalWatchTime: 0,
          watchList: [],
        };
        await setDoc(userRef, { ...newUserProfile, createdAt: serverTimestamp() });
      }
      // No need to return profile, onAuthStateChanged will handle it
    } else {
      throw new Error("User registration failed, no user object returned.");
    }
  } catch (error: any) {
    console.error("Error signing up with email and password: ", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email address is already in use.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please choose a stronger password.");
    }
    throw new Error(error.message || "An unknown error occurred during sign-up.");
  }
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<void> => {
  if (!firebaseAuthInstance) {
    throw new Error("Firebase not configured. Sign-in unavailable.");
  }
  try {
    await firebaseSignInWithEmailPassword(firebaseAuthInstance, email, password);
    // onAuthStateChanged will handle fetching the profile
  } catch (error: any) {
    console.error("Error signing in with email and password: ", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || "An unknown error occurred during sign-in.");
  }
};

export const signOut = async (): Promise<void> => {
  if (!firebaseAuthInstance) {
    throw new Error("Firebase not configured. Sign-out unavailable.");
  }
  try {
    await firebaseSignOut(firebaseAuthInstance);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
