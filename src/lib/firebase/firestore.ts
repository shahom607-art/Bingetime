import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '@/types';
import type { Media } from '@/services/tmdb';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data() as Omit<UserProfile, 'uid'>; // Assuming uid is not part of the stored document fields directly under data()
    return { uid, ...data };
  }
  return null;
};

export const updateUserWatchlist = async (uid: string, mediaItem: Media, action: 'add' | 'remove'): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  try {
    if (action === 'add') {
      await updateDoc(userRef, {
        watchList: arrayUnion(mediaItem),
        totalWatchTime: increment(mediaItem.duration)
      });
    } else {
      // To remove, Firestore needs the exact object.
      // This might be tricky if the object in array is not perfectly identical.
      // A more robust way would be to fetch, filter, and set, but arrayRemove is simpler if objects match.
      await updateDoc(userRef, {
        watchList: arrayRemove(mediaItem),
        totalWatchTime: increment(-mediaItem.duration)
      });
    }
  } catch (error) {
    console.error(`Error ${action === 'add' ? 'adding to' : 'removing from'} watchlist:`, error);
    // If updateDoc fails (e.g. document doesn't exist), create it
    if (action === 'add' && (error as any).code === 'not-found') {
        const userProfile = await getUserProfile(uid); // Attempt to get basic info
        const initialProfile: UserProfile = {
            uid,
            displayName: userProfile?.displayName || 'New User',
            email: userProfile?.email || '',
            photoURL: userProfile?.photoURL || '',
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
  const userRef = doc(db, 'users', uid);
  // Ensure only valid fields are updated
  const dataToUpdate: Partial<UserProfile> = {};
  if (profileData.totalWatchTime !== undefined) dataToUpdate.totalWatchTime = profileData.totalWatchTime;
  if (profileData.watchList !== undefined) dataToUpdate.watchList = profileData.watchList;
  // Add other fields if necessary, e.g., displayName, photoURL

  if (Object.keys(dataToUpdate).length > 0) {
     await setDoc(userRef, dataToUpdate, { merge: true });
  }
};
