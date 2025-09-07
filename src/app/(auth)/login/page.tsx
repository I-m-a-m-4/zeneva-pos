
"use client";

import *as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const [isSigningUp, setIsSigningUp] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);
  const { status } = useAuth();


  // Sign Up State
  const [signUpBusinessName, setSignUpBusinessName] = React.useState('');
  const [signUpFullName, setSignUpFullName] = React.useState('');
  const [signUpEmail, setSignUpEmail] = React.useState('');
  const [signUpPassword, setSignUpPassword] = React.useState('');

  // Sign In State
  const [signInEmail, setSignInEmail] = React.useState('');
  const [signInPassword, setSignInPassword] = React.useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = React.useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);

    if (!signUpBusinessName || !signUpFullName || !signUpEmail || !signUpPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'All fields are required for sign up.' });
        setIsSigningUp(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;

      const businessDocRef = doc(db, 'businessInstances', user.uid);
      await setDoc(businessDocRef, {
        ownerId: user.uid,
        ownerEmail: user.email,
        businessName: signUpBusinessName,
        subscriptionTierId: 'free',
        status: 'Trial',
        createdAt: serverTimestamp(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        settings: {
          currency: 'NGN',
          timezone: 'Africa/Lagos',
          defaultTaxRate: 7.5,
        }
      });
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        fullName: signUpFullName,
        email: user.email,
        role: 'admin',
        businessId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      toast({
        variant: 'success',
        title: 'Account Created Successfully!',
        description: `Welcome to Zeneva, ${signUpFullName}! Your new business, "${signUpBusinessName}", is ready.`,
        duration: 7000
      });
      
      // The AuthProvider will automatically handle redirecting to the dashboard upon successful authentication state change.

    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already in use. Please try logging in or use a different email.';
      } else if (error.code === 'auth/weak-password') {
          errorMessage = 'The password is too weak. Please use at least 6 characters.';
      } else {
          errorMessage = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMessage,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
        await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
        toast({
            variant: 'success',
            title: 'Login Successful!',
            description: "Welcome back! Redirecting to your dashboard...",
        });
        // The AuthProvider will handle the redirect upon successful authentication state change.
    } catch (error: any) {
        console.error("Sign in error:", error);
        toast({
            variant: 'destructive',
            title: 'Sign In Failed',
            description: "Invalid email or password. Please check your credentials and try again.",
        });
    } finally {
        setIsSigningIn(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address to reset your password." });
      return;
    }
    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        variant: "success",
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
      setResetEmail('');
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Could not send reset email. Please check the address and try again.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Create Account</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to your Zeneva account to manage your business.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" placeholder="you@example.com" required value={signInEmail} onChange={e => setSignInEmail(e.target.value)} disabled={isSigningIn}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" type="password" required value={signInPassword} onChange={e => setSignInPassword(e.target.value)} disabled={isSigningIn}/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Sign In
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                 <Button variant="link" size="sm" className="text-xs">Forgot your password?</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset Your Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                   <Label htmlFor="reset-email">Email Address</Label>
                   <Input id="reset-email" type="email" placeholder="you@example.com" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} disabled={isResettingPassword}/>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" disabled={isResettingPassword}>Cancel</Button></DialogClose>
                  <Button onClick={handlePasswordReset} disabled={isResettingPassword}>
                    {isResettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Send Reset Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create your Zeneva Account</CardTitle>
            <CardDescription>
              Start with a 14-day free trial on our Pro plan. No credit card required.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="signup-business-name">Business Name</Label>
              <Input id="signup-business-name" placeholder="e.g., Ada's Apparel" required value={signUpBusinessName} onChange={e => setSignUpBusinessName(e.target.value)} disabled={isSigningUp}/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="signup-full-name">Your Full Name</Label>
              <Input id="signup-full-name" placeholder="e.g., Ada Eze" required value={signUpFullName} onChange={e => setSignUpFullName(e.target.value)} disabled={isSigningUp}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="you@example.com" required value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} disabled={isSigningUp}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" required minLength={6} value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} disabled={isSigningUp}/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
            <Button className="w-full" type="submit" disabled={isSigningUp}>
              {isSigningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Create Account
            </Button>
          </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

