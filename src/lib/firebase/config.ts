
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfigValues: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseInitializationError: Error | null = null;

// Check if essential Firebase config values are present for core app initialization
const essentialConfigPresent = firebaseConfigValues.apiKey && firebaseConfigValues.authDomain && firebaseConfigValues.projectId;

if (essentialConfigPresent) {
  if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfigValues) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      firebaseInitializationError = null;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      firebaseInitializationError = error as Error;
    }
  }
} else {
  const missingKeys = [
    !firebaseConfigValues.apiKey && "NEXT_PUBLIC_FIREBASE_API_KEY",
    !firebaseConfigValues.authDomain && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    !firebaseConfigValues.projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ].filter(Boolean).join(', ');

  const warningMessage =
    "Firebase core configuration is incomplete. Some values (" +
    (missingKeys || "apiKey, authDomain, projectId") +
    ") are missing or undefined. If any Firebase services are intended to be used, they may not function. " +
    "Please check your NEXT_PUBLIC_FIREBASE_ environment variables in .env.local.";
  console.warn(warningMessage);
}

export { app, auth, db, firebaseInitializationError };
// To completely remove Firebase client SDK if no services are used, 
// this file would be emptied or deleted, and NEXT_PUBLIC_FIREBASE_ variables removed from .env.local.
