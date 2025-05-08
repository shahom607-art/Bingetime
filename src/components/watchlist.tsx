'use client';

import type { FC } from 'react';
import { useWatchlist } from '@/hooks/use-watchlist';
import WatchlistItem from './watchlist-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListX } from "lucide-react";

const Watchlist: FC = () => {
  const { watchList, removeItemFromWatchlist, loading, error } = useWatchlist();

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Watchlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8 max-w-md mx-auto">
        <AlertTitle>Error Loading Watchlist</AlertTitle>
        <AlertDescription>{error.message || "An unexpected error occurred."}</AlertDescription>
      </Alert>
    );
  }
  
  if (watchList.length === 0 && !loading) {
    return (
      <div className="mt-12 text-center">
         <ListX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Watchlist is Empty</h2>
        <p className="text-muted-foreground">
          Search for movies and TV shows above to add them to your list.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">Your Watchlist</h2>
      <ScrollArea className="h-auto pb-4"> {/* Adjust height as needed or remove for full page scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchList.map((item) => (
            <WatchlistItem key={item.id} item={item} onRemove={removeItemFromWatchlist} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Watchlist;
