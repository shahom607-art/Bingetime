import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db as firebaseDbInstance } from './config'; // Aliased import
import type { UserProfile } from '@/types';
import type { Media } from '@/services/tmdb';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!firebaseDbInstance) {
    console.error("Firebase Firestore not initialized. Cannot get user profile.");
    return null;
  }
  const userRef = doc(firebaseDbInstance, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data() as Omit<UserProfile, 'uid'>;
    return { uid, ...data };
  }
  return null;
};

export const updateUserWatchlist = async (uid: string, mediaItem: Media, action: 'add' | 'remove'): Promise<void> => {
  if (!firebaseDbInstance) {
    console.error("Firebase Firestore not initialized. Cannot update watchlist.");
    throw new Error("Firebase not configured. Watchlist update failed.");
  }
  const userRef = doc(firebaseDbInstance, 'users', uid);
  try {
    if (action === 'add') {
      await updateDoc(userRef, {
        watchList: arrayUnion(mediaItem),
        totalWatchTime: increment(mediaItem.duration)
      });
    } else {
      await updateDoc(userRef, {
        watchList: arrayRemove(mediaItem),
        totalWatchTime: increment(-mediaItem.duration)
      });
    }
  } catch (error) {
    console.error(`Error ${action === 'add' ? 'adding to' : 'removing from'} watchlist:`, error);
    if (action === 'add' && (error as any).code === 'not-found') {
        const userProfileData = await getUserProfile(uid); // Attempt to get basic info, might be null if new user or other issue
        const initialProfile: UserProfile = {
            uid,
            displayName: userProfileData?.displayName || 'New User', // Fallback displayName
            email: userProfileData?.email || '', // Fallback email
            photoURL: userProfileData?.photoURL || '', // Fallback photoURL
            totalWatchTime: mediaItem.duration,
            watchList: [mediaItem]
        }
        await setDoc(userRef, initialProfile);
    } else {
        throw error;
    }
  }
};

export const syncUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
  if (!firebaseDbInstance) {
    console.error("Firebase Firestore not initialized. Cannot sync user profile.");
    throw new Error("Firebase not configured. Profile sync failed.");
  }
  const userRef = doc(firebaseDbInstance, 'users', uid);
  const dataToUpdate: Partial<UserProfile> = {};
  if (profileData.totalWatchTime !== undefined) dataToUpdate.totalWatchTime = profileData.totalWatchTime;
  if (profileData.watchList !== undefined) dataToUpdate.watchList = profileData.watchList;
  
  if (Object.keys(dataToUpdate).length > 0) {
     await setDoc(userRef, dataToUpdate, { merge: true });
  }
};
