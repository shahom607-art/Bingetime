
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuthState } from '@/hooks/use-auth-state'; // Removed
// import { Button } from '@/components/ui/button'; // Removed if not used for other buttons
// import Link from 'next/link'; // Removed if not used
import { Loader2 } from 'lucide-react';
// import { BingeTimeLogo } from '@/components/icons/logo'; // Can be kept if needed, but page will redirect

export default function LandingPage() {
  // const { user, loading } = useAuthState(); // Removed
  const router = useRouter();

  useEffect(() => {
    // Always redirect to dashboard as there's no login
    router.replace('/dashboard');
  }, [router]);

  // Show a simple loading state during redirection
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Loading BingeTime...</p>
    </div>
  );
}
