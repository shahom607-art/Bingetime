'use client';

import SearchBar from '@/components/search-bar';
import TotalTimeDisplay from '@/components/total-time-display';
import Watchlist from '@/components/watchlist';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuthState } from '@/hooks/use-auth-state';
import { Button } from '@/components/ui/button';
// import { signInWithGoogle } from '@/lib/firebase/auth'; // No longer needed
import { Loader2, LogIn, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AuthDialog from '@/components/auth/auth-dialog'; // Import the new AuthDialog

export default function HomePage() {
  const { totalWatchTime, loading: watchlistLoading, error: watchlistError } = useWatchlist();
  const { user, loading: authLoading, error: authError } = useAuthState();
  const { toast } = useToast(); // Keep toast for other potential messages

  // handleSignIn is no longer needed here as AuthDialog handles sign-in internally

  if (authLoading || watchlistLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your BingeTime...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {authError.message || "Could not connect to authentication services. Please ensure your Firebase configuration is correct if you are the developer."}
            <p className="mt-2 text-xs">If this issue persists, please contact support.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center space-y-10">
      <section className="w-full text-center pt-8 pb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Welcome to BingeTime!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover how much time you've dedicated to your favorite movies and TV shows. Search, add, and see your total watch time pile up!
        </p>
      </section>

      {!user && (
        <section className="w-full max-w-md mx-auto p-6 bg-card border rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-3">Sign in to save your progress!</h2>
          <p className="text-muted-foreground mb-4">
            Guests can track their time, but signing in syncs your watchlist across devices.
          </p>
          <AuthDialog
            trigger={
              <Button size="lg" disabled={!!authError}>
                <LogIn className="mr-2 h-5 w-5" /> Sign In / Create Account
              </Button>
            }
            initialTab="signin"
          />
        </section>
      )}
      
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
