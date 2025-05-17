
'use client';

import Link from 'next/link';
import { BingeTimeLogo } from '@/components/icons/logo';
// import { Button } from '@/components/ui/button'; // Removed as no buttons are left
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Removed
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'; // Removed
// import { useAuthState } from '@/hooks/use-auth-state'; // Removed
// import { signOut } from '@/lib/firebase/auth'; // Removed
// import { LogIn, LogOut, Loader2 } from 'lucide-react'; // Removed
// import { useToast } from '@/hooks/use-toast'; // Removed if not used for other toasts

export default function Header() {
  // const { user, userProfile, loading } = useAuthState(); // Removed
  // const { toast } = useToast(); // Removed

  // const handleSignOut = async () => { ... }; // Removed

  // const getInitials = (...) => { ... }; // Removed

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2"> {/* Link to dashboard now */}
          <BingeTimeLogo />
        </Link>
        
        {/* Auth related UI removed */}
        {/* {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user && userProfile ? (
            ... Avatar and Dropdown ...
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Register
              </Link>
            </Button>
          )} */}
      </div>
    </header>
  );
}
