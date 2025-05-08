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
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AuthDialogProps {
  trigger: React.ReactNode;
  initialTab?: 'signin' | 'signup';
}

const AuthDialog: FC<AuthDialogProps> = ({ trigger, initialTab = 'signin' }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast(); // Initialize useToast

  const handleAuthSuccess = () => {
    setOpen(false); // Close dialog on successful sign-in
  };
  
  const handleSignUpSuccess = () => {
    toast({ 
      title: 'Account Created!',
      description: 'Please sign in with your new credentials.',
    });
    setActiveTab('signin'); // Switch to sign-in tab
    // Don't close dialog immediately after sign-up, let user sign in.
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
            <SignInForm onSignInSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="signup" className="pt-6">
            <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
