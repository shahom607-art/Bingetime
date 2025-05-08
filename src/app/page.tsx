'use client';

import SearchBar from '@/components/search-bar';
import TotalTimeDisplay from '@/components/total-time-display';
import Watchlist from '@/components/watchlist';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuthState } from '@/hooks/use-auth-state';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { totalWatchTime, loading: watchlistLoading } = useWatchlist();
  const { user, loading: authLoading } = useAuthState();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({ title: 'Signed In', description: 'Welcome to BingeTime!' });
    } catch (error) {
      console.error('Sign in failed:', error);
      toast({ title: 'Sign In Failed', description: 'Could not sign you in. Please try again.', variant: 'destructive' });
    }
  };

  if (authLoading || watchlistLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your BingeTime...</p>
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
            Guests can track their time, but signing in with Google syncs your watchlist across devices.
          </p>
          <Button onClick={handleSignIn} size="lg">
            <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
          </Button>
        </section>
      )}
      
      <section className="w-full">
        <SearchBar />
      </section>

      <section className="w-full">
        <TotalTimeDisplay totalSeconds={totalWatchTime} />
      </section>

      <section className="w-full">
        <Watchlist />
      </section>
    </div>
  );
}
