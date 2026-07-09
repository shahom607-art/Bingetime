
import type { Media } from '@/services/tmdb';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  totalWatchTime: number;
  watchList: Media[];
}

// Used for guest mode in local storage (now the primary data storage)
export interface GuestData {
  totalWatchTime: number; // in seconds
  watchList: Media[];
}
