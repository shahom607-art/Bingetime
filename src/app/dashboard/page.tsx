
'use client';

// import { useEffect } from 'react'; // No longer needed for auth redirect
// import { useRouter } from 'next/navigation'; // No longer needed for auth redirect
import SearchBar from '@/components/search-bar';
import TotalTimeDisplay from '@/components/total-time-display';
import Watchlist from '@/components/watchlist';
import { useWatchlist } from '@/hooks/use-watchlist';
// import { useAuthState } from '@/hooks/use-auth-state'; // Removed
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const { totalWatchTime, loading: watchlistLoading, error: watchlistError } = useWatchlist();
  // const { user, loading: authLoading, error: authError } = useAuthState(); // Removed
  // const router = useRouter(); // Removed

  // useEffect(() => { // Auth redirection logic removed
  //   if (!authLoading && !user) {
  //     router.replace('/login');
  //   }
  // }, [user, authLoading, router]);

  if (watchlistLoading) { // Only check watchlistLoading now
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your BingeTime Dashboard...</p>
      </div>
    );
  }

  // authError handling removed

  return (
    <div className="flex flex-col items-center space-y-10">
      <section className="w-full text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent px-1 leading-normal">
          Your BingeTime Dashboard
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Search, add, and manage your watched movies and TV shows. See your total watch time update instantly!
        </p>
      </section>
      
      <section className="w-full">
        <SearchBar />
      </section>

      <section className="w-full">
        <TotalTimeDisplay totalSeconds={totalWatchTime} />
      </section>
      
      {watchlistError && (
         <Alert variant="destructive" className="w-full max-w-2xl mx-auto">
           <AlertTriangle className="h-5 w-5" />
           <AlertTitle>Watchlist Error</AlertTitle>
           <AlertDescription>
             {watchlistError.message || "Could not load your watchlist at the moment. Data is stored in your browser's local storage."}
           </AlertDescription>
         </Alert>
      )}

      <section className="w-full">
        <Watchlist />
      </section>
    </div>
  );
}
