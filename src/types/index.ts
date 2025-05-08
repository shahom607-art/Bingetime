import type { Media } from '@/services/tmdb';

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  totalWatchTime: number; // in seconds
  watchList: Media[];
}

// Used for guest mode in local storage
export interface GuestData {
  totalWatchTime: number;
  watchList: Media[];
}
