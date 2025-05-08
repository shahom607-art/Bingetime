
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/search-bar';
import TotalTimeDisplay from '@/components/total-time-display';
import Watchlist from '@/components/watchlist';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuthState } from '@/hooks/use-auth-state';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const { totalWatchTime, loading: watchlistLoading, error: watchlistError } = useWatchlist();
  const { user, loading: authLoading, error: authError } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || watchlistLoading || (!user && !authError)) { // Also show loading if user is null but no authError yet (during initial redirect phase)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your BingeTime Dashboard...</p>
      </div>
    );
  }

  if (authError) {
    // This case should ideally be handled by redirecting to login,
    // but if an error occurs after initial load or during auth state change, show it.
     router.replace('/login'); // Force redirect on auth error
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-lg text-muted-foreground">Redirecting...</p>
       </div>
     );
  }
  
  // If user is null after loading and no authError, it means redirect should have happened.
  // This is a fallback or for brief moments before redirect takes effect.
  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-lg text-muted-foreground">Authenticating...</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col items-center space-y-10">
      <section className="w-full text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Your BingeTime Dashboard
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
             {watchlistError.message || "Could not load your watchlist at the moment."}
           </AlertDescription>
         </Alert>
      )}

      <section className="w-full">
        <Watchlist />
      </section>
    </div>
  );
}
