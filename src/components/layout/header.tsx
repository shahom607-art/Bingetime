'use client';

import Link from 'next/link';
import { BingeTimeLogo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthState } from '@/hooks/use-auth-state';
import { signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const { user, userProfile, loading } = useAuthState();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been signed out.' });
    } catch (error) {
      console.error('Sign out failed:', error);
      toast({ title: 'Sign Out Failed', description: 'Could not sign you out. Please try again.', variant: 'destructive' });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'G'; // Guest or Generic
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BingeTimeLogo />
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Placeholder */}
          {/* <Button variant="ghost" size="icon"><Sun className="h-5 w-5" /></Button> */}

          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName || 'User'} />
                    <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleSignIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
