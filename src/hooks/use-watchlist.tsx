
'use client';

import { useState, useEffect, useCallback, useContext, createContext, type ReactNode } from 'react';
// Removed Auth-related imports: useAuthState, firebaseAuthInstance, firebaseDbInstance, getUserProfile, updateUserWatchlist, syncUserProfile
import type { Media } from '@/services/tmdb';
import type { GuestData } from '@/types'; // UserProfile removed from types
import { useToast } from '@/hooks/use-toast';

interface WatchlistContextType {
  watchList: Media[];
  totalWatchTime: number; // in seconds
  addItemToWatchlist: (item: Media) => Promise<void>;
  removeItemFromWatchlist: (itemId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'bingeTimeGuestData';

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  // Removed useAuthState
  const [watchList, setWatchList] = useState<Media[]>([]);
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadDataFromLocalStorage = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const guestDataString = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestDataString) {
        const guestData: GuestData = JSON.parse(guestDataString);
        setWatchList(guestData.watchList || []);
        setTotalWatchTime(guestData.totalWatchTime || 0);
      } else {
        setWatchList([]);
        setTotalWatchTime(0);
      }
    } catch (e) {
      console.error("Failed to load data from local storage", e);
      setError(e as Error);
      setWatchList([]);
      setTotalWatchTime(0);
      toast({ title: "Error", description: "Could not load saved data.", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  const saveDataToLocalStorage = useCallback((currentWatchList: Media[], currentTotalWatchTime: number) => {
    try {
      const guestData: GuestData = { watchList: currentWatchList, totalWatchTime: currentTotalWatchTime };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
    } catch (e) {
      console.error("Failed to save data to local storage", e);
      setError(e as Error); // Set error state
      toast({ title: "Error", description: "Could not save data locally.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    // Load data directly from localStorage on initial mount
    loadDataFromLocalStorage();
  }, [loadDataFromLocalStorage]);

  const addItemToWatchlist = async (item: Media) => {
    setError(null);
    if (watchList.find(m => m.id === item.id)) {
      toast({ title: "Already Added", description: `${item.title} is already in your watchlist.` });
      return;
    }

    const newWatchList = [...watchList, item];
    const newTotalWatchTime = totalWatchTime + item.duration;
    
    setWatchList(newWatchList);
    setTotalWatchTime(newTotalWatchTime);
    saveDataToLocalStorage(newWatchList, newTotalWatchTime);
    toast({ title: "Added to Watchlist", description: `${item.title} has been added.` });
  };

  const removeItemFromWatchlist = async (itemId: string) => {
    setError(null);
    const itemToRemove = watchList.find(m => m.id === itemId);
    if (!itemToRemove) return;

    const newWatchList = watchList.filter(m => m.id !== itemId);
    const newTotalWatchTime = totalWatchTime - itemToRemove.duration;

    setWatchList(newWatchList);
    setTotalWatchTime(newTotalWatchTime);
    saveDataToLocalStorage(newWatchList, newTotalWatchTime);
    toast({ title: "Removed from Watchlist", description: `${itemToRemove.title} has been removed.` });
  };
  
  // Removed useEffect for syncing guest data with Firebase user as auth is removed.

  return (
    <WatchlistContext.Provider value={{ watchList, totalWatchTime, addItemToWatchlist, removeItemFromWatchlist, loading, error }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
