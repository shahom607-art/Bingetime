
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { BingeTimeLogo } from '@/components/icons/logo';

export default function LandingPage() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading BingeTime...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 min-h-[calc(100vh-20rem)] py-12">
      <BingeTimeLogo className="w-48 h-auto mb-4" />
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        Welcome to BingeTime!
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Track your movie and TV show watch hours effortlessly. Discover just how much time you've dedicated to your favorite entertainment.
      </p>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/login">
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/register">
            <UserPlus className="mr-2 h-5 w-5" /> Create Account
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground pt-8 max-w-md mx-auto">
        Sign up or log in to start building your watchlist and see your total binge time accumulate.
      </p>
    </div>
  );
}
