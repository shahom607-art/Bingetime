'use client';

import { useState, useEffect, useCallback, useContext, createContext, type ReactNode } from 'react';
import { useAuthState } from './use-auth-state';
import { getUserProfile, updateUserWatchlist, syncUserProfile } from '@/lib/firebase/firestore';
import type { Media } from '@/services/tmdb';
import type { UserProfile, GuestData } from '@/types';
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
  const { user, loading: authLoading } = useAuthState();
  const [watchList, setWatchList] = useState<Media[]>([]);
  const [totalWatchTime, setTotalWatchTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadGuestData = useCallback(() => {
    try {
      const guestDataString = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestDataString) {
        const guestData: GuestData = JSON.parse(guestDataString);
        setWatchList(guestData.watchList);
        setTotalWatchTime(guestData.totalWatchTime);
      } else {
        setWatchList([]);
        setTotalWatchTime(0);
      }
    } catch (e) {
      console.error("Failed to load guest data from local storage", e);
      setError(e as Error);
      setWatchList([]);
      setTotalWatchTime(0);
    }
    setLoading(false);
  }, []);

  const saveGuestData = useCallback((currentWatchList: Media[], currentTotalWatchTime: number) => {
    try {
      const guestData: GuestData = { watchList: currentWatchList, totalWatchTime: currentTotalWatchTime };
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
    } catch (e) {
      console.error("Failed to save guest data to local storage", e);
      setError(e as Error);
      toast({ title: "Error", description: "Could not save data locally.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    if (user) {
      getUserProfile(user.uid)
        .then(profile => {
          if (profile) {
            setWatchList(profile.watchList || []);
            setTotalWatchTime(profile.totalWatchTime || 0);
          } else {
            // New user, ensure profile is created or use defaults
            setWatchList([]);
            setTotalWatchTime(0);
          }
        })
        .catch(e => {
          console.error("Failed to load user profile", e);
          setError(e as Error);
          toast({ title: "Error", description: "Could not load your watchlist.", variant: "destructive" });
        })
        .finally(() => setLoading(false));
    } else {
      loadGuestData();
    }
  }, [user, authLoading, loadGuestData, toast]);

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

    if (user) {
      try {
        await updateUserWatchlist(user.uid, item, 'add');
        toast({ title: "Added to Watchlist", description: `${item.title} has been added.` });
      } catch (e) {
        console.error("Failed to add item to Firestore", e);
        setError(e as Error);
        toast({ title: "Error", description: "Could not add item to your cloud watchlist.", variant: "destructive" });
        // Rollback optimistic update
        setWatchList(watchList);
        setTotalWatchTime(totalWatchTime);
      }
    } else {
      saveGuestData(newWatchList, newTotalWatchTime);
      toast({ title: "Added to Watchlist", description: `${item.title} has been added.` });
    }
  };

  const removeItemFromWatchlist = async (itemId: string) => {
    setError(null);
    const itemToRemove = watchList.find(m => m.id === itemId);
    if (!itemToRemove) return;

    const newWatchList = watchList.filter(m => m.id !== itemId);
    const newTotalWatchTime = totalWatchTime - itemToRemove.duration;

    setWatchList(newWatchList);
    setTotalWatchTime(newTotalWatchTime);

    if (user) {
      try {
        await updateUserWatchlist(user.uid, itemToRemove, 'remove');
        toast({ title: "Removed from Watchlist", description: `${itemToRemove.title} has been removed.` });
      } catch (e) {
        console.error("Failed to remove item from Firestore", e);
        setError(e as Error);
        toast({ title: "Error", description: "Could not remove item from your cloud watchlist.", variant: "destructive" });
        // Rollback optimistic update
        setWatchList(watchList);
        setTotalWatchTime(totalWatchTime);
      }
    } else {
      saveGuestData(newWatchList, newTotalWatchTime);
      toast({ title: "Removed from Watchlist", description: `${itemToRemove.title} has been removed.` });
    }
  };
  
  // Sync local storage to Firestore on login
  useEffect(() => {
    if (user && !authLoading) {
      const guestDataString = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestDataString) {
        const guestData: GuestData = JSON.parse(guestDataString);
        if (guestData.watchList.length > 0 || guestData.totalWatchTime > 0) {
          // Merge guest data with Firestore data. A simple strategy: add all guest items not already present.
          // This could be more sophisticated (e.g., conflict resolution).
          getUserProfile(user.uid).then(async (profile) => {
            let mergedWatchList = profile?.watchList || [];
            let mergedTotalWatchTime = profile?.totalWatchTime || 0;

            guestData.watchList.forEach(guestItem => {
              if (!mergedWatchList.find(item => item.id === guestItem.id)) {
                mergedWatchList.push(guestItem);
                mergedTotalWatchTime += guestItem.duration;
              }
            });
            
            if (mergedWatchList.length !== (profile?.watchList.length || 0)) {
              try {
                await syncUserProfile(user.uid, { watchList: mergedWatchList, totalWatchTime: mergedTotalWatchTime });
                setWatchList(mergedWatchList);
                setTotalWatchTime(mergedTotalWatchTime);
                localStorage.removeItem(GUEST_STORAGE_KEY); // Clear guest data after sync
                toast({ title: "Data Synced", description: "Your local watchlist has been merged with your account." });
              } catch (e) {
                console.error("Error syncing guest data to Firestore:", e);
                toast({ title: "Sync Error", description: "Could not sync local data.", variant: "destructive" });
              }
            } else {
               localStorage.removeItem(GUEST_STORAGE_KEY); // Clear if no new items to merge
            }
          });
        } else {
            localStorage.removeItem(GUEST_STORAGE_KEY); // Clear if guest data is empty
        }
      }
    }
  }, [user, authLoading, toast]);


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
