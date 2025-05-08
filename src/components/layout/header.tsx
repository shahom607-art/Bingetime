
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
import { signOut } from '@/lib/firebase/auth';
import { LogIn, LogOut, Loader2 } from 'lucide-react'; // Removed UserIcon as it wasn't used
import { useToast } from '@/hooks/use-toast';
// import AuthDialog from '@/components/auth/auth-dialog'; // AuthDialog no longer used here

export default function Header() {
  const { user, userProfile, loading } = useAuthState();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      // Router will handle redirect via useAuthState hook in page components
    } catch (error: any) {
      console.error('Sign out failed:', error);
      toast({ title: 'Sign Out Failed', description: error.message || 'Could not sign you out. Please try again.', variant: 'destructive' });
    }
  };

  const getInitials = (displayName?: string | null, email?: string | null) => {
    if (displayName) {
      const parts = displayName.trim().split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length -1] && parts[0].length > 0 && parts[parts.length-1].length > 0) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts[0] && parts[0].length > 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      if (parts[0] && parts[0].length === 1) {
        return parts[0][0].toUpperCase();
      }
    }
    if (email && email.length > 0) {
      return email.substring(0, 1).toUpperCase();
    }
    return 'U'; // User
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BingeTimeLogo />
        </Link>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName || userProfile.email || 'User'} />
                    <AvatarFallback>{getInitials(userProfile.displayName, userProfile.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.displayName || userProfile.email || 'User'}</p>
                    {userProfile.displayName && userProfile.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Register
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
