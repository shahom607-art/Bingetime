
'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './sign-in-form';
import SignUpForm from './sign-up-form';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Added for potential future use within dialog

interface AuthDialogProps {
  trigger: React.ReactNode;
  initialTab?: 'signin' | 'signup';
  onAuthSuccessRedirect?: string; // Optional redirect path after success
}

const AuthDialog: FC<AuthDialogProps> = ({ trigger, initialTab = 'signin', onAuthSuccessRedirect }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();
  const router = useRouter(); // Added for potential future use

  // Note: SignInForm and SignUpForm now handle their own redirection.
  // This dialog's success handlers are simplified.
  const handleSignInSuccess = () => {
    setOpen(false); 
    if (onAuthSuccessRedirect) router.push(onAuthSuccessRedirect);
    // SignInForm will redirect to /dashboard by default
  };
  
  const handleSignUpSuccess = () => {
    // SignUpForm will redirect to /login by default
    // Toast is handled in SignUpForm
    // This logic could be used to switch tabs if SignUpForm didn't redirect
    // For now, it might not be strictly necessary if SignUpForm always redirects.
    // setActiveTab('signin'); 
    setOpen(false); // Close dialog after sign up IF it's still open
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'signin' 
              ? "Sign in to access your BingeTime watchlist." 
              : "Join BingeTime to track your favorite shows and movies."}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="pt-6">
            {/* SignInForm now redirects internally. onSignInSuccess prop is for dialog-specific actions like closing. */}
            <SignInForm /> 
          </TabsContent>
          <TabsContent value="signup" className="pt-6">
            {/* SignUpForm now redirects internally. onSignUpSuccess prop is for dialog-specific actions. */}
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
