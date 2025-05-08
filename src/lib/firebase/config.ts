import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Define a placeholder for when Firebase cannot be initialized.
const uninitializedFirebase = {
  app: null as FirebaseApp | null,
  auth: null as Auth | null,
  db: null as Firestore | null,
};

const firebaseConfigValues: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = uninitializedFirebase.app;
let auth: Auth | null = uninitializedFirebase.auth;
let db: Firestore | null = uninitializedFirebase.db;

if (
  firebaseConfigValues.apiKey &&
  firebaseConfigValues.authDomain &&
  firebaseConfigValues.projectId
) {
  // Ensure Firebase is initialized only on the client-side for this setup
  if (typeof window !== 'undefined') {
    try {
      const currentAppInstance = getApps().length === 0
        ? initializeApp(firebaseConfigValues)
        : getApp();
      app = currentAppInstance;
      auth = getAuth(currentAppInstance);
      db = getFirestore(currentAppInstance);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // app, auth, db remain null as per uninitializedFirebase
    }
  }
} else {
  console.warn(
    "Firebase configuration is incomplete. Essential values (apiKey, authDomain, projectId) are missing. " +
    "Firebase services will not be available. " +
    "Please check your NEXT_PUBLIC_FIREBASE_ environment variables in .env.local."
  );
  // app, auth, db are already null from uninitializedFirebase
}

export { app, auth, db };
