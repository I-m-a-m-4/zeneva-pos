
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

interface ReauthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function ReauthDialog({ 
  isOpen, 
  onOpenChange, 
  onSuccess, 
  onCancel,
  title = "Authentication Required",
  description = "For your security, please enter your password to continue."
}: ReauthDialogProps) {
  const { toast } = useToast();
  const [password, setPassword] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const auth = getAuth();

  const handleReauth = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Error", description: "No authenticated user found." });
      return;
    }
    if (!password) {
      toast({ variant: "destructive", title: "Password Required", description: "Please enter your password." });
      return;
    }

    setIsVerifying(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      toast({ variant: "success", title: "Success", description: "Authentication successful." });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Re-authentication error:", error);
      toast({ variant: "destructive", title: "Authentication Failed", description: "The password you entered is incorrect." });
    } finally {
      setIsVerifying(false);
      setPassword("");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && onCancel) {
      onCancel();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary"/> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="reauth-password">Password</Label>
           <div className="relative">
            <Input
              id="reauth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              onKeyPress={(e) => e.key === 'Enter' && handleReauth()}
              disabled={isVerifying}
            />
             <Button
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isVerifying}>Cancel</Button>
          <Button onClick={handleReauth} disabled={isVerifying}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isVerifying ? "Verifying..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
