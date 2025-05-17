
import type { Media } from '@/services/tmdb';

// UserProfile is no longer needed as Firebase Auth is removed.

// Used for guest mode in local storage (now the primary data storage)
export interface GuestData {
  totalWatchTime: number; // in seconds
  watchList: Media[];
}
